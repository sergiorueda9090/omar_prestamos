import React, { useContext, useState } from "react";
import { Button } from "@mui/material"
import { MdDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa6";
import { FaCartArrowDown } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from "../../App";
import { FaUsers } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";

export const Sidebar = () => {

    const [activeTab, setActiveTab]             = useState(0);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
    const context = useContext(MyContext); 

    const isOpenSubmenu = (index) => {
        setActiveTab(index);
        setIsToggleSubmenu(!isToggleSubmenu);
    }

    
    const menuItems = [
    { id: 0, label: "Dashboard", icon: <MdDashboard />, path: "/" },
    { id: 1, label: "Usuarios", icon: <FaUsers />, path: "/users" },
    { id: 2, label: "Clientes", icon: <IoMdPeople />, path: "/clientes" },
    {
        id: 13,
        label: "Products",
        icon: <FaProductHunt />,
        submenu: [
        { label: "Product List", path: "#" },
        { label: "Product View", path: "#" },
        { label: "Product Upload", path: "/product/upload" },
        ]
    },
    { id: 14, label: "Orders", icon: <FaCartArrowDown />, path: "/" },
    { id: 115, label: "Messages", icon: <MdMessage />, path: "/" },
    { id: 15, label: "Notifications", icon: <FaBell />, path: "/" },
    { id: 16, label: "Settings", icon: <IoSettingsSharp />, path: "/" },
    ];

    const SidebarMenu = ({ activeTab, isToggleSubmenu, isOpenSubmenu }) => (
        <ul>
            {menuItems.map(item => (
            <li key={item.id}>
                {item.submenu ? (
                <>
                    <Button
                    className={`w-100 ${activeTab === item.id && isToggleSubmenu ? 'active' : ''}`}
                    onClick={() => isOpenSubmenu(item.id)}
                    >
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    <span className="arrow"><FaAngleRight /></span>
                    </Button>
                    <div className={`submenuWrapper ${activeTab === item.id && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                    <ul className="submenu">
                        {item.submenu.map((sub, i) => (
                        <li key={i}>
                            <Link to={sub.path}>{sub.label}</Link>
                        </li>
                        ))}
                    </ul>
                    </div>
                </>
                ) : (
                <Link to={item.path}>
                    <Button
                    className={`w-100 ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => isOpenSubmenu(item.id)}
                    >
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    <span className="arrow"><FaAngleRight /></span>
                    </Button>
                </Link>
                )}
            </li>
            ))}
        </ul>
        );

    return (
        <div className="sidebar">
           <SidebarMenu activeTab={activeTab} isToggleSubmenu={isToggleSubmenu} isOpenSubmenu={isOpenSubmenu}/>
            <br />
            <div className="logoutWrapper">
                <div className="logoutBox">
                    <Button variant="contained">
                       <IoMdLogOut/> Logout
                    </Button>
                </div>
            </div>

        </div>
    )
    

}