const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

const app = express();
const http = require('http');
const server = http.createServer(app);
const {init , getIo} = require('./helper/socketIO/socket.js')
// const {io, getReceiverSocketId} = socketIo(server);

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());


//Routes
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRAMS.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');
const bannersSchema = require('./routes/banners.js');
const homeSideBannerSchema = require('./routes/homeSideBanner.js');
const homeBottomBannerSchema = require('./routes/homeBottomBanner.js');
const promotionCodeRoutes = require('./routes/promotionCode.js');
const postRoutes = require('./routes/posts.js');
const postTypeRoutes = require('./routes/postTypes.js');
const commentRoutes = require('./routes/comments.js');
const storeLocationRoutes = require('./routes/storeLocations.js');
const batchCodeRoutes = require('./routes/batchCodes.js');
const messageRoutes = require('./routes/messages.js')

app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);
app.use(`/api/banners`, bannersSchema);
app.use(`/api/homeSideBanners`, homeSideBannerSchema);
app.use(`/api/homeBottomBanners`, homeBottomBannerSchema);
app.use("/api/promotionCode", promotionCodeRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/postTypes", postTypeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/storeLocations", storeLocationRoutes);
app.use("/api/batchCodes", batchCodeRoutes);
app.use("/api/messages", messageRoutes)

init(server)
//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');
        //Server
        server.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })

const io = getIo();

io.on("connection", socket => {
  console.log("User connected (extra handler):", socket.id);
  socket.emit("message", "Hello from server (extra)");
});