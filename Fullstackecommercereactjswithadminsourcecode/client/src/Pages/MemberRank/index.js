import { useEffect, useState, useContext } from "react";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import UpgradeRankBox from "../../Components/UpgradeRankBox";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import "./index.css";

const RankPage = () => {
  const [userRank, setUserRank] = useState("bronze");
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showUpgradeBox, setShowUpgradeBox] = useState(false); // thêm state này
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signIn");
      return;
    }
    fetchDataFromApi(`/api/user/user-rank-stats?userId=${context.user.userId}`).then((res) => {
      setUserRank(res.rank);
      setTotalSpent(res.totalSpent);
      setTotalOrders(res.totalOrders);
    });

    context.setEnableFilterTab(false);
  }, [context.user]);


  const handleUpgradeClick = () => {
    setShowUpgradeBox(true); // bật hiển thị
  };

  const handleCloseUpgradeBox = () => {
    setShowUpgradeBox(false); // đóng hộp thoại
  };

  const handleRankUpgraded = (newRank) => {
    setUserRank(newRank);
  };

  return (
    <section className="section rankPage">
      <div className="container">
        <h2 className="hd mb-1">Your Membership Rank</h2>
        <p className="mb-3">Current Rank: <b className="text-red">{userRank?.charAt(0).toUpperCase() + userRank?.slice(1)}</b></p>
        <p>Total Spent Previous Month: <b>${totalSpent}</b></p>
        <p>Total Orders Previous Month: <b>{totalOrders}</b></p>

        <Button 
          className="btn-blue bg-red btn-lg btn-round mt-3 mb-4" 
          onClick={handleUpgradeClick}
        >
          Check Upgrade Conditions
        </Button>
        {/* UpgradeRankBox render ở đây */}
        {showUpgradeBox && (
          <UpgradeRankBox
            currentRank={userRank}
            totalOrders={totalOrders}
            totalSpent={totalSpent}
            onClose={handleCloseUpgradeBox}
            onUpgradeSuccess={handleRankUpgraded}
          />
        )}

        <div className="rank-guide">
          <h3>Ranking System</h3>
          <ul>
            <li><b>Bronze</b> – Less than 5 orders or less than $2,000 → No discount</li>
            <li><b>Silver</b> – At least 5 orders and $2,000 → <b>5% discount</b> on all products</li>
            <li><b>Gold</b> – At least 10 orders and $5,000 → <b>10% discount</b> and exclusive deals</li>
            <li><b>Platinum</b> – At least 20 orders and $10,000 → <b>15% discount</b>, priority shipping, and gifts</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default RankPage;
