import React from "react";
import { Button } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import profileImg from '../../assets/images/license/profile.jpg'
import bannerImg from '../../assets/images/license/banner2.png';
import infoImg from '../../assets/images/license/info.jpg';

const IntroduceAndLicense = () => {
  return (
    <div className="container py-5" style={{ background: "#fff" }}>
      <h1 className="text-center text-blue font-bold mb-5" style={{ fontSize: "32px" }}>
        <InfoOutlinedIcon fontSize="large" /> Giới Thiệu & Giấy Phép
      </h1>

      <div className="row align-items-center mb-5">
        <div className="col-md-6 mb-4 mb-md-0">
          <img
            src={profileImg}
            alt="Giới thiệu về nhóm"
            style={{ width: "100%", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          />
        </div>
        <div className="col-md-6">
          <h3 className="text-blue mb-3"><SchoolOutlinedIcon /> Về Chúng Tôi</h3>
          <p style={{ fontSize: "16px", lineHeight: "1.7" }}>
            Chúng tôi là <strong>Trần Trọng Khang</strong> và <strong>Đăng Minh Thiện</strong>, sinh viên năm 4 trường Đại học Sư phạm Kỹ thuật.  
            Dự án “Website bán hàng nông sản” được phát triển nhằm phục vụ nhu cầu học tập, thực hành, và nghiên cứu.
          </p>
        </div>
      </div>

      <div className="row align-items-center mb-5 flex-md-row-reverse">
        <div className="col-md-6 mb-4 mb-md-0">
          <img
            src={bannerImg}
            alt="Mục tiêu dự án"
            style={{ width: "100%", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          />
        </div>
        <div className="col-md-6">
          <h3 className="text-blue mb-3">🌿 Mục Tiêu Dự Án</h3>
          <ul style={{ lineHeight: "1.8", fontSize: "16px" }}>
            <li>Kết nối trực tiếp người tiêu dùng và nhà nông.</li>
            <li>Hỗ trợ bán hàng minh bạch, sản phẩm sạch và rõ nguồn gốc.</li>
            <li>Ứng dụng công nghệ ReactJS - NodeJS - MongoDB - Express hiện đại.</li>
            <li>Đưa kiến thức học tập vào thực tế.</li>
          </ul>
        </div>
      </div>

      <div className="row align-items-center mb-5">
        <div className="col-md-6 mb-4 mb-md-0">
          <img
            src={infoImg}
            alt="Giấy phép sử dụng"
            style={{ width: "100%", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          />
        </div>
        <div className="col-md-6">
          <h3 className="text-blue mb-3"><GavelOutlinedIcon /> Giấy Phép</h3>
          <p style={{ fontSize: "16px", lineHeight: "1.7" }}>
            Dự án được thực hiện với mục đích <strong>phi thương mại</strong> và phục vụ cho việc học tập - nghiên cứu.
            Mọi mã nguồn và nội dung chỉ được sử dụng trong nội bộ nhóm. Nếu có nhu cầu sử dụng lại, vui lòng liên hệ nhóm thực hiện.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button className="btn-green btn-big btn-round" href="/">
          Trở về Trang Chủ
        </Button>
      </div>
    </div>
  );
};

export default IntroduceAndLicense;
