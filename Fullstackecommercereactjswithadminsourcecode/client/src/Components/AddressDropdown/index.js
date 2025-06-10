import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { FaAngleDown } from "react-icons/fa6";
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Slide from '@mui/material/Slide';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData, editData, deleteData } from '../../utils/api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CountryDropdown = () => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenAddDialog, setIsOpenAddDialog] = useState(false);
    const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);

    const [newAddress, setNewAddress] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [newName, setNewName] = useState("");

    const [editIndex, setEditIndex] = useState(null);
    const [editAddress, setEditAddress] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editName, setEditName] = useState("");

    const [selectedTab, setSelectedTab] = useState(null);
    const [addressList, setAddressList] = useState([]);

    const context = useContext(MyContext);
    const userContext = context.user;

    const selectAddress = (index, address) => {
        setSelectedTab(index);
        setIsOpenModal(false);
        context.setselectedAddress(address);
        localStorage.setItem("address", JSON.stringify(address));
        window.location.reload();
    };

    useEffect(() => {
        setAddressList(context.addressList);
    }, [context.addressList]);

    // Add new address
    const handleSaveNewAddress = () => {
        onAdd(newAddress, newPhoneNumber, newName);
        setNewAddress("");
        setNewPhoneNumber("");
        setNewName("");
        setIsOpenAddDialog(false);
    };

    const onAdd = async (address, phoneNumber, name) => {
        try {
            const payload = { address, phoneNumber, name };
            await postData(`/api/userAddress/add/${userContext.userId}`, payload);
            const res = await fetchDataFromApi(`/api/userAddress?userId=${userContext.userId}`);
            context.setAddressList(res[0]?.addresses || []);
        } catch (error) {
            console.error("Add address error:", error);
        }
    };

    // Open edit dialog and pre-fill current address data
    const openEditDialog = (index) => {
        const item = addressList[index];
        setEditIndex(index);
        setEditAddress(item.address);
        setEditPhoneNumber(item.phoneNumber || "");
        setEditName(item.name || "");
        setIsOpenEditDialog(true);
    };

    // Save edited address
    const handleSaveEditAddress = async () => {
        if (!editAddress.trim()) {
            alert("Address cannot be empty");
            return;
        }

        try {
            await editData(`/api/userAddress/${userContext.userId}/${editIndex}`, {
                address: editAddress,
                phoneNumber: editPhoneNumber,
                name: editName,
            });

            const res = await fetchDataFromApi(`/api/userAddress?userId=${userContext.userId}`);
            context.setAddressList(res[0]?.addresses || []);

            setIsOpenEditDialog(false);
            setEditIndex(null);
            setEditAddress("");
            setEditPhoneNumber("");
            setEditName("");
        } catch (error) {
            console.error("Edit address error:", error);
        }
    };

    // Delete address
    const onDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        try {
            if(context.selectedAddress?.id === addressList[index].id){
                context.setselectedAddress(null)
                localStorage.removeItem("address");
            }
            await deleteData(`/api/userAddress/${userContext.userId}/${index}`);
            const res = await fetchDataFromApi(`/api/userAddress?userId=${userContext.userId}`);
            context.setAddressList(res[0]?.addresses || []);
        } catch (error) {
            console.error("Delete address error:", error);
        }
    };

    return (
        <>
            <Button className='countryDrop' onClick={() => {
                setIsOpenModal(true);
                setAddressList(context.addressList);
            }}>
                <div className='info d-flex flex-column'>
                    <span className='label'>Delivered address</span>
                    <span className='name'>
                        {context.selectedAddress?.address
                            ? context.selectedAddress.address.length > 10
                                ? context.selectedAddress.address.substr(0, 10) + '...'
                                : context.selectedAddress.address
                            : 'Select Address'}
                    </span>
                </div>

                <span className='ml-auto'><FaAngleDown /></span>
            </Button>

            {/* Address list modal */}
            <Dialog open={isOpenModal} onClose={() => setIsOpenModal(false)} className='locationModal' TransitionComponent={Transition}>
                <h4 className='mb-0'>Choose your Delivery Address</h4>
                <p>Enter your address and we will specify the offer for your area.</p>
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>

                <ul className='countryList mt-3'>
                    {addressList.length > 0 ? addressList.map((item, index) => (
                        <li key={index} className='d-flex justify-between align-items-center'>
                            <Button
                                onClick={() => selectAddress(index, item)}
                                className={`${selectedTab === index ? 'active' : ''}`}
                            >
                                {item.address}
                            </Button>
                            <div className="ml-2 d-flex gap-2">
                                <Button size="small" onClick={() => openEditDialog(index)}><span className='text-primary'>Edit</span></Button>
                                <Button size="small" onClick={() => onDelete(index)}><span className='text-danger'>Delete</span></Button>
                            </div>
                        </li>
                    )) : <li>No addresses found.</li>}

                    {/* Add new address button */}
                    <li className='mt-3'>
                        <Button variant="outlined" onClick={() => setIsOpenAddDialog(true)}>+ Add Address</Button>
                    </li>
                </ul>
            </Dialog>

            {/* Add Address dialog */}
            <Dialog open={isOpenAddDialog} onClose={() => setIsOpenAddDialog(false)} TransitionComponent={Transition}>
                <div className='p-4'>
                    <h5>Add New Address</h5>
                    <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter address..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <input
                        type="text"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder="Enter phone number..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />

                    <div className='d-flex justify-end'>
                        <Button onClick={handleSaveNewAddress} variant="contained">Save</Button>
                    </div>
                </div>
            </Dialog>

            {/* Edit Address dialog */}
            <Dialog open={isOpenEditDialog} onClose={() => setIsOpenEditDialog(false)} TransitionComponent={Transition}>
                <div className='p-4'>
                    <h5>Edit Address</h5>
                    <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Enter address..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <input
                        type="text"
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        placeholder="Enter phone number..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter name..."
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                    />

                    <div className='d-flex justify-end'>
                        <Button onClick={handleSaveEditAddress} variant="contained">Save</Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default CountryDropdown;
