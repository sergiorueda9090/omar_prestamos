import React, {useContext, useEffect, useState} from "react";
import { DashboardBox } from "./components/dashboardBox"
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import { IoIosTimer } from "react-icons/io";
import { Button } from "@mui/material"
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Chart } from "react-google-charts";

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { FaEye }        from "react-icons/fa";
import { FaPencilAlt }  from "react-icons/fa";
import { MdDelete }     from "react-icons/md";

import Pagination from '@mui/material/Pagination';
import { MyContext } from "../../App";


{/*
const options = [
    'None',
    'Atria',
    'Callisto',
  ];
*/}



const data = [
    ["Year", "Sales", "Expenses"],
    ["2014", 1000, 400],
    ["2015", 1170, 460],
    ["2016", 660, 1120],
    ["2017", 1030, 540],
  ];

// Material chart options
const options = {
    'backgroundColor':'transparent',
    'chartArea':{'width':'100%', 'height':'100%'}
  };
export const Dashboard = () => {

    const ITEM_HEIGHT = 48;
    const context = useContext(MyContext)

    useEffect(() =>{
        context.setIsHideSideBarAndHeader(false)
        window.scrollTo(0,0);
    },[])

        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
          setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
          setAnchorEl(null);
        };

        const [showBy, setShowBy]         = useState('');
        const [showCatBy,  setShowCatBy]  = useState('');

    

    return (
        <>
            <div className="right-content w-100">

                <div className="row dashboardBoxWrapperRow">

                    <div className="col-md-8">
                
                        <div className={`dashboardBoxWrapper ${context.windowWidth > 992 && 'd-flex'}`}>
                            <DashboardBox color={["#1da256","#28d483"]} icon={<FaUserCircle/>} grow={true}/>
                            <DashboardBox color={["#c012e2","#eb64fe"]} icon={<IoMdCart/>}/>
                            <DashboardBox color={["#2c78e5","#60aff5"]} icon={<MdShoppingBag/>}/>
                            <DashboardBox color={["#e1950e","#f3cd29"]} icon={<GiStarsStack/>}/>
                        </div>

                    </div>

                    <div className="col-md-4  topPart2">

                        <div className="box graphBox">

                            <div className="d-flex align-items-center w-100 bottomEle">
                                <h6 className="text-white mb-0 mt-0">Total Sales</h6>
                                <div className="ms-auto">
                                    <Button className="ms-auto toggleIcon" onClick={handleClick}><HiDotsVertical/></Button>
            
                                    <Menu
                                        className="dropdown_menu"
                                        MenuListProps={{
                                        'aria-labelledby': 'long-button',
                                        }}
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
                                            <IoIosTimer/> Last Day
                                        </MenuItem>
            
                                        <MenuItem key="Last Weed" onClick={handleClose}>
                                            <IoIosTimer/> Last Weed
                                        </MenuItem>
            
                                        <MenuItem key="Last Month" onClick={handleClose}>
                                            <IoIosTimer/> Last Month
                                        </MenuItem>
            
                                        <MenuItem key="Last Year" onClick={handleClose}>
                                            <IoIosTimer/> Last Year
                                        </MenuItem>
                                
                                    </Menu>
            
                                </div>
                                
                            </div>

                            <h3 className="text-white font-weight-bold">$3,787,681.00</h3>
                            <p className="text-white">$3,787,681.00 in the last Month</p>
                            
                            <Chart 
                                chartType="PieChart" 
                                width="100%"
                                height="170px"
                                data={data}
                                options={options}/>

                        </div>
                        
                    </div>

                </div>
                
                <div className="card shadow border-0 p-3 mt-4">
                    <h3 className="hd">Best Selling Products</h3>

                    <div className="row cardFilters mt-3">
                        <div className="col-md-3">
                            <h4>SHOW BY</h4>
                            <FormControl size="small" fullWidth className="w'100">
                                <Select
                                    value={showBy}
                                    displayEmpty
                                    onChange={(e) => setShowBy(e.target.value)}
                                    inputProps={{'aria-label':'Without label'}}
                                    className="w-100"
                                    >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>

                        </div>

                        <div className="col-md-3">
                            <h4>CATEGORY BY</h4>
                            <FormControl size="small" fullWidth className="w'100">
                                <Select
                                    value={showCatBy}
                                    displayEmpty
                                    labelId="demo-select-small-label"
                                    onChange={(e) => setShowCatBy(e.target.value)}
                                    inputProps={{'aria-label':'Without label'}}
                                    className="w-100"
                                    >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>

                        </div>

                        <div className="col-md-3">
                            <h4>SHOW BY</h4>
                            <FormControl size="small" fullWidth className="w'100">
                                <Select
                                    value={showBy}
                                    displayEmpty
                                    onChange={(e) => setShowBy(e.target.value)}
                                    inputProps={{'aria-label':'Without label'}}
                                    className="w-100"
                                    >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>

                        </div>

                        <div className="col-md-3">
                            <h4>SHOW BY</h4>
                            <FormControl size="small" fullWidth className="w'100">
                                <Select
                                    value={showBy}
                                    displayEmpty
                                    onChange={(e) => setShowBy(e.target.value)}
                                    inputProps={{'aria-label':'Without label'}}
                                    className="w-100"
                                    >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    <div className="table-responsive mt-3">
                        <table className="table table-bordered v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>UID</th>
                                    <th style={{width:'300px'}}>PRODUCT</th>
                                    <th>CATEGORY</th>
                                    <th>BRAND</th>
                                    <th>PRINCE</th>
                                    <th>STOCK</th>
                                    <th>RATING</th>
                                    <th>ORDER</th>
                                    <th>SALES</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <div className="d-flex productBox align-items-center">
                                            <div className="imgWrapper">
                                                <div className="img">
                                                    <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" 
                                                        alt=""
                                                        className="w-100" />
                                                </div>
                                            </div>
                                            <div className="info pl-0">
                                                <h6>Top  and skirt set for Famele....</h6>
                                                <p>Lorem ipsum dolor sit ignissimos optio in.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>
                                        <div className={{width:'70px'}}>
                                            <del className="old">$21.00</del>
                                            <span className="new text-danger">$21.00</span>
                                        </div>
                                    </td>
                                    <td>Otto</td>
                                    <td>@mdo</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Button className="secondary" color="secondary"><FaEye/></Button>
                                            <Button className="success"   color="success"><FaPencilAlt/></Button>
                                            <Button className="error"     color="error"><MdDelete/></Button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                        
                        <div className="d-flex tableFooter">
                            <p>showing <b>12</b> of <b>60</b> result </p>
                            <Pagination className="pagination" 
                                        count={10} 
                                        color="primary"
                                        showFirstButton
                                        showLastButton />
                        </div>

                    </div>

                </div>
            </div>
        </>
        
    )
}