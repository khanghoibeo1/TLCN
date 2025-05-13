import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { editData } from '../../utils/api';
import { MyContext } from '../../App';

const rankConditions = [
  { rank: 'platinum', orders: 20, amount: 10000 },
  { rank: 'gold', orders: 10, amount: 5000 },
  { rank: 'silver', orders: 5, amount: 2000 },
  { rank: 'bronze', orders: 0, amount: 0 }
];

const getNextRank = (currentRank) => {
  const index = rankConditions.findIndex(r => r.rank === currentRank);
  return rankConditions[index - 1]; // ranks are sorted from highest to lowest
};

const UpgradeRankBox = ({ currentRank, totalOrders, totalSpent, onClose, onUpgradeSuccess }) => {
  const [open, setOpen] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [nextRankInfo, setNextRankInfo] = useState(null);
  const context = useContext(MyContext);
  const userContext = context.user;

  useEffect(() => {
    const nextRank = getNextRank(currentRank);

    if (!nextRank) {
      setNextRankInfo(null);
      setEligible(false);
      return;
    }

    const isEligible = totalOrders >= nextRank.orders && totalSpent >= nextRank.amount;
    setNextRankInfo(nextRank);
    setEligible(isEligible);
  }, [currentRank, totalOrders, totalSpent]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleUpgrade = () => {
    console.log(`Upgrade to ${nextRankInfo.rank}`);
    setOpen(false);
    // You can call an API to upgrade the rank here
    editData(`/api/user/upgrade-rank/${nextRankInfo.rank}?userId=${userContext.userId}`).then(()=>{
        onClose?.();
        onUpgradeSuccess?.(nextRankInfo.rank);
    })
    .catch(e => console.error('Upgraded fail:',e));
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Membership Rank Upgrade</DialogTitle>
      <DialogContent>
        {nextRankInfo ? (
          <>
            <Typography>
              Your current rank: <strong>{currentRank}</strong>
            </Typography>
            <Typography>
              Next rank: <strong>{nextRankInfo.rank}</strong> – Requirements: at least {nextRankInfo.orders} orders and ${nextRankInfo.amount.toLocaleString()}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Your current stats: {totalOrders} orders – ${totalSpent.toLocaleString()}
            </Typography>
            {!eligible && (
              <Typography color="error" sx={{ mt: 1 }}>
                You are not eligible for an upgrade yet.
              </Typography>
            )}
          </>
        ) : (
          <Typography>You already have the highest rank (Platinum).</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {eligible ? 'Cancel' : 'Close'}
        </Button>
        {eligible && (
          <Button onClick={handleUpgrade} variant="contained" color="primary">
            Upgrade
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeRankBox;
