import React, {useContext, useState} from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.webp"

import { Button, Divider }               from "@mui/material";
import { MdMenuOpen }           from "react-icons/md";
import { MdOutlineMenu } from "react-icons/md";

import { CiLight } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";

import { IoMdCart } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";

import { MdEmail } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";

import { FaRegBell } from "react-icons/fa";
import { MdOutlineLightMode } from "react-icons/md";

import { SearchBox } from "../SearchBox";

import { IoShieldHalf } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { MyContext } from '../../App';
import { logout as logoutAction } from '../../store/authStore/authStoreActions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const Header = () => {

    const [anchorEl, setanchorEl] = useState(null);
    const [isOpennotificationDrop, setisOpennotificationDrop] = useState(false);
    const openMyAcc = Boolean(anchorEl);
    const openNotification = Boolean(isOpennotificationDrop);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const context = useContext(MyContext)

    const handleOpenMyAccDr = (event) => {
        setanchorEl(event.currentTarget);
    };

    const handleCloseMyAccDr = () => {
        setanchorEl(null);
    };

    const handleOpennotificationsDrop = () => {
        setisOpennotificationDrop(true);
    };

    const handleClosenotificationsDrop = () => {
        setisOpennotificationDrop(false);
    };

    const hangleLogout = () => {
        dispatch(logoutAction(navigate))
    }

    return (
        <>
            <header className="d-flex align-items-center">
                <div className="container-fluid w-100">

                    <div className="row d-flex align-items-center w-100">
                        
                        {/*Logo wraoor */}
                        <div className="col-sm-2 part1">
                            <Link to={"/"} className="d-flex align-items-center logo">
                                <img src={logo} />
                                <span className="ml-2">HOTASH</span>
                            </Link>
                        </div>
                        {
                            context.windowWidth > 992 && <div className="col-sm-3 d-flex align-items-center part2 gap-3 res-hide">
                            <Button className="rounded-circle mr-5" onClick={() => context.setIsToggleSidebar(!context.isToggleSidebar)}>

                                {
                                    context.isToggleSidebar === false ? <MdMenuOpen/> : <MdOutlineMenu/>
                                }
                            </Button>
                            <SearchBox />
                        </div>
                        }



                        <div className="col-sm-7 d-flex align-items-center justify-content-end part3 gap-3">
                            <Button className="rounded-circle" onClick={()=>context.setThemeMode(!context.themeMode)}>
                                <CiLight/>
                            </Button>
                            
                            <Button className="rounded-circle"><IoCartOutline/></Button>

                            <Button className="rounded-circle"><IoMailOutline/></Button>
                            <Button className="rounded-circle"><MdOutlineLightMode/></Button>

                            <div className="dropdownWrapper position-relative">
                                <Button className="rounded-circle" onClick={handleOpennotificationsDrop}><FaRegBell/></Button>
                                <Button className="rounded-circle" onClick={() => context.openNav()}><IoMenu/></Button>
                                <Menu
                                    anchorEl={isOpennotificationDrop}
                                    className='notifications dropdown_list'
                                    id="notifications"
                                    open={openNotification}
                                    onClose={handleClosenotificationsDrop}
                                    onClick={handleClosenotificationsDrop}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >   
                                    <div className='head ps-3 pb-0 pt-3 '>
                                        <h4> Orders (12)</h4>
                                    </div>

                                    <Divider className='mb-1'/>
                                    <div className='scroll'></div>

                                    <MenuItem onClick={handleClosenotificationsDrop}>

                                        <div className='d-flex'>
                                            <div>
                                                <div className="userImg">
                                                    <span className='rounded-circle'>
                                                        <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='dropdownInfo'>
                                                <h4>
                                                    <span>
                                                        <b>Mahmudul</b>
                                                        added to this favorite list
                                                        <b>Leather belt steve madden</b>
                                                    </span>  
                                                </h4>
                                                <p className='text-sky mb-0'> Few seconds ago</p>
                                            </div>
                                        </div>
                                    </MenuItem>

                                    <MenuItem onClick={handleClosenotificationsDrop}>
                                        <div className='d-flex'>
                                            <div>
                                                <div className="userImg">
                                                    <span className='rounded-circle'>
                                                        <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='dropdownInfo'>
                                                <h4>
                                                    <span>
                                                        <b>Mahmudul</b>
                                                        added to this favorite list
                                                        <b>Leather belt steve madden</b>
                                                    </span>  
                                                </h4>
                                                <p className='text-sky mb-0'> Few seconds ago</p>
                                            </div>
                                        </div>
                                    </MenuItem>

                                    <MenuItem onClick={handleClosenotificationsDrop}>
                                        <div className='d-flex'>
                                            <div>
                                                <div className="userImg">
                                                    <span className='rounded-circle'>
                                                        <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='dropdownInfo'>
                                                <h4>
                                                    <span>
                                                        <b>Mahmudul</b>
                                                        added to this favorite list
                                                        <b>Leather belt steve madden</b>
                                                    </span>  
                                                </h4>
                                                <p className='text-sky mb-0'> Few seconds ago</p>
                                            </div>
                                        </div>
                                    </MenuItem>

    
                                   

                                    <div className='ps-2 pe-2 w-100 pt-2 pb-1'>
                                     <Button className="btn-blue w-100"> View all notifications</Button>
                                    </div>
                                    
                                </Menu>
                            </div>
                        {
                            context.isLogin !== true ? 
                             <Link to="/login" className='btn-blue btn-lg btn-round'>
                                 <Button className='btn-blue btn-lg btn-round' onClick={hangleLogout}>Sign In</Button>
                             </Link> :

                            <div className="myAccWrapper">
                                <Button className="myAcc d-flex align-items-center" onClick={handleOpenMyAccDr}>
                                    <div className="userImg">
                                        <span className="rounded-circle">
                                            <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                                        </span>
                                    </div>

                                    <div className="userInfo res-hide">
                                        <h4>Sergio Rueda</h4>
                                        <p className="mb-0">Admin</p>
                                    </div>
                                </Button>

                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={openMyAcc}
                                    onClose={handleCloseMyAccDr}
                                    onClick={handleCloseMyAccDr}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >

                                    <MenuItem onClick={handleCloseMyAccDr}>
                                        <ListItemIcon>
                                            <PersonAdd fontSize="small" />
                                        </ListItemIcon>
                                        My Account
                                    </MenuItem>

                                    <MenuItem onClick={handleCloseMyAccDr}>
                                        <ListItemIcon>
                                            <IoShieldHalf />
                                        </ListItemIcon>
                                        Reset Password
                                    </MenuItem>

                                    <MenuItem onClick={handleCloseMyAccDr}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                            Logout
                                        </MenuItem>
                                </Menu>
                            </div>
                        }
                        

                        </div>
                        
                    </div>

                </div>
            </header>
        </>
    )   

}