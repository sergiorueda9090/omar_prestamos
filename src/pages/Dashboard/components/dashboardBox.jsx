import React, { useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { Button, Menu, MenuItem, IconButton } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { IoIosTimer } from "react-icons/io";
import { useSelector, useDispatch } from 'react-redux';

const ITEM_HEIGHT = 48;

export const DashboardBox = (props) => {
  const { value } = useSelector(state => state.userStore);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        className="dashboardBox"
        style={{
          backgroundImage: `linear-gradient(to right, ${props.color?.[0]}, ${props.color?.[1]})`,
        }}
      >
        {props.grow === true ? (
          <span className="chart"><TrendingUpIcon /></span>
        ) : (
          <span className="chart"><TrendingDownIcon /></span>
        )}

        <div className="d-flex w-100">
          <div className="col1">
            <h4 className="text-white mb-0">Total User</h4>
            <span className="text-white">277 - {value}</span>
          </div>

          <div className="ms-auto">
            <span className="icon">{props.icon}</span>
          </div>
        </div>

        <div className="d-flex align-items-center w-100 bottomEle">
          <h6 className="text-white mb-0 mt-0">Last Month</h6>
          <div className="ms-auto">
            <IconButton className="ms-auto toggleIcon" onClick={handleClick}>
              <HiDotsVertical />
            </IconButton>

            <Menu
              className="dropdown_menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: '20ch',
                  },
                },
              }}
            >
              <MenuItem key="Last Day" onClick={handleClose}>
                <IoIosTimer /> Last Day
              </MenuItem>

              <MenuItem key="Last Week" onClick={handleClose}>
                <IoIosTimer /> Last Week
              </MenuItem>

              <MenuItem key="Last Month" onClick={handleClose}>
                <IoIosTimer /> Last Month
              </MenuItem>

              <MenuItem key="Last Year" onClick={handleClose}>
                <IoIosTimer /> Last Year
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Button>
    </>
  );
};
