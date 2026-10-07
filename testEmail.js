require("dotenv").config();

const { guiOTP } = require("./config/email");

guiOTP("luuk64517@gmail.com", "123456")
    .then(() => {
        console.log("Gửi email thành công!");
    })
    .catch((error) => {
        console.log("Lỗi gửi email:");
        console.log(error);
    });