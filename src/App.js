
import './App.css';
import './responsive.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dashboard }    from './pages/Dashboard';
import { Users }        from './pages/Users';
import { Header }       from './components/Header';
import { Sidebar }      from './components/Sidebar';
import {Login}          from './pages/Login';
import { SingUp }       from './pages/SignUp';
import React, { createContext, useEffect,useState } from 'react';
import PrivateRoute from './routes/PrivateRoute';
import { RouterMain } from './routes/RouterMain';

const MyContext = createContext();

function App() {

  const [isToggleSidebar, setIsToggleSidebar] = useState(false)
  const [isHideSideBarAndHeader, setIsHideSideBarAndHeader] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [themeMode, setThemeMode] = useState(true);

  useEffect(() => {
    
    if(themeMode){
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('themeMode', 'light');
    }else{
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    }
  },[themeMode])


  useEffect(() => {
      const hableResize = () => {
        setWindowWidth(window.innerWidth);
      };

    window.addEventListener('resize', hableResize);
    return () => {
      window.removeEventListener('resize', hableResize);
    };
  }, []);
  
  const openNav = () => {
   setIsOpenNav(true)
  }

  const values={
    isToggleSidebar,
    setIsToggleSidebar,
    isHideSideBarAndHeader, 
    setIsHideSideBarAndHeader,
    themeMode,
    setThemeMode,
    windowWidth, 
    setWindowWidth,
    openNav,
    isOpenNav,
    setIsOpenNav
  }

  useEffect(() => {

  }, [isToggleSidebar ])
  

  return (
          <BrowserRouter>
            <MyContext.Provider value={values}>
              {isHideSideBarAndHeader !== true && <Header />}
              <div className='main d-flex'>

                {isHideSideBarAndHeader !== true && (
                  <>
                    <div
                      className={`sidebarOverlay d-none ${isOpenNav === true ? 'show' : ''}`}
                      onClick={() => setIsOpenNav(false)}
                    ></div>
                    <div className={`sidebarWrapper ${isToggleSidebar ? 'toggle' : ''} ${isOpenNav ? 'open' : ''}`}>
                      <Sidebar />
                    </div>
                  </>
                )}

                <div className={`content ${isHideSideBarAndHeader === true ? 'full' : ''} ${isToggleSidebar ? 'toggle' : ''}`}>
                  <RouterMain/>
                </div>
              </div>
            </MyContext.Provider>
          </BrowserRouter>

  )
}

export default App;
export {MyContext}