const express = require('express');
const router = express.Router();
const { UserAddress } = require('../models/userAddress');
const axios = require('axios');

router.get(`/`, async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    const list = await UserAddress.find(filter);

    if (!list || list.length === 0) {
      return res.status(404).json({ success: false, message: 'No address found' });
    }

    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


// GET single address doc by id
router.get('/:id', async (req, res) => {
  try {
    const address = await UserAddress.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found.' });
    }
    return res.status(200).send(address);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});


router.post('/add/:id', async (req, res) => {
  try {
    const { phoneNumber, name, address, isDefault } = req.body;
    const userId = req.params.id;

    console.log("Address:", address);
    console.log("User ID:", userId);

    // Gọi API Nominatim để lấy lat/lng từ address
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        'User-Agent': 'AgriStoreApp/1.0'
      }
    });

    if (!response.data || response.data.length === 0) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy tọa độ cho địa chỉ này' });
    }

    const { lat, lon } = response.data[0];

    const newEntry = {
      phoneNumber: phoneNumber || "",
      name: name || "",
      address: address || "",
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      isDefault: isDefault || false,
    };

    let userAddress = await UserAddress.findOne({ userId });

    if (userAddress) {
      await UserAddress.updateOne(
        { userId },
        { $push: { addresses: newEntry } }
      );
    } else {
      userAddress = new UserAddress({
        userId,
        addresses: [newEntry],
      });
      await userAddress.save();
    }

    return res.status(201).json({ success: true, message: 'Address added.', address: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// UPDATE a specific address inside addresses[] by userAddressId and index
router.put('/:userId/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;
    const { phoneNumber, name, address, lat, lng, isDefault } = req.body;

    const userDoc = await UserAddress.findOne({userId});
    if (!userDoc) return res.status(404).json({ message: 'UserAddress not found' });

    const addr = userDoc.addresses[index];
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    addr.phoneNumber = phoneNumber || addr.phoneNumber;
    addr.name = name || addr.name;
    addr.address = address || addr.address;
    addr.lat = lat ?? addr.lat;
    addr.lng = lng ?? addr.lng;
    addr.isDefault = isDefault ?? addr.isDefault;

    await userDoc.save();

    return res.status(200).json({ success: true, message: 'Address updated', updatedAddress: addr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// DELETE address by index
router.delete('/:userId/:index', async (req, res) => {
  try {
    const { userId, index } = req.params;

    const userDoc = await UserAddress.findOne({userId});
    if (!userDoc) return res.status(404).json({ message: 'UserAddress not found' });

    if (!userDoc.addresses[index]) {
      return res.status(404).json({ message: 'Address index invalid' });
    }

    userDoc.addresses.splice(index, 1);
    await userDoc.save();

    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
