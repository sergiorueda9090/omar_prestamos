import { useEffect, useContext, useState } from 'react';
import Logo from '../../assets/images/logo.webp';
import pattern from '../../assets/images/pattern.webp';
import { MyContext } from '../../App';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";

export const SingUp = () => {

    const [inputIndex, setInputIndex]         = useState(null);
    const [isShowPassword, setIsShowPassword] =  useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] =  useState(false);
    const context = useContext(MyContext)

    useEffect(() => {
        context.setIsHideSideBarAndHeader(true);
        window.scrollTo(0,0);
    },[])

    const focusInput = (index) => {
        setInputIndex(index);
   
    }

    return (
            <>
                <img src={pattern} className='loginPattern' />
                <section className="loginSection signUpSection">
                    
                    <div className='row'>
                        <div className='col-md-8 d-flex align-items-center flex-column part1 justify-content-center'>
                            <h1>
                                BETS UX/UI FASHIN <span className='text-sky'>ECOMMERCE DASHBOARD</span> & ADMIN PANEL
                            </h1>
                            <p>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas quis illum similique eligendi eos ratione incidunt expedita! 
                                Est necessitatibus libero perferendis itaque praesentium dolor deleniti, temporibus animi vitae blanditiis quaerat?
                            </p>
                            
                            <div className='w-100 mt-4'>
                                <Link to={'/'}>
                                    <Button className='btn-blue btn-lg btn-big'>
                                        <IoMdHome /> Go To Home
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='col-md-4 pr-0'>
                            <div className="loginBox">
                                <div className="logo text-center">
                                    <img src={Logo} width="60px" />
                                    <h5 className='font-weight-bold'>Register a new account</h5>
                                </div>

                                <div className='wrapper mt-3 card border p-4'>
                                    <form>
                                        <div className={`form-group position-relative ${ inputIndex == 0 && 'focus'}`}>
                                            <span className='icon'>
                                                <MdEmail/>
                                            </span>
                                            <input type="text" className='form-control' placeholder='Enter your email' 
                                                onFocus={()=>focusInput(0)} onBlur={() => setInputIndex(null)} autoFocus/>
                                        </div>

                                        <div className={`form-group position-relative ${ inputIndex == 1 && 'focus'}`}>
                                            <span className='icon'>
                                                <FaUserCircle/>
                                            </span>
                                            <input type="text" className='form-control' placeholder='Enter your user' 
                                                onFocus={()=>focusInput(1)} onBlur={() => setInputIndex(null)}/>
                                        </div>

                                        <div className={`form-group position-relative ${ inputIndex == 2 && 'focus'}`}>
                                            <span className='icon'>
                                                <RiLockPasswordFill/>
                                            </span>
                                            <input type={`${isShowPassword==true ? 'text' : 'password'}`} className='form-control' placeholder='Enter your password' 
                                                onFocus={()=>focusInput(2)} onBlur={() => setInputIndex(null)}/>
                                                
                                            <span className='toggleShowPassword' onClick={ () => setIsShowPassword(!isShowPassword)}>
                                                {
                                                    isShowPassword == true ? < FaEyeSlash /> : <IoEyeSharp />
                                                }
                                                
                                            </span>
                                        </div>

                                        <div className={`form-group position-relative ${ inputIndex == 3 && 'focus'}`}>
                                            <span className='icon'>
                                                <IoShieldCheckmark/>
                                            </span>
                                            <input type={`${isShowConfirmPassword==true ? 'text' : 'password'}`} className='form-control' placeholder='Confir your password' 
                                                onFocus={()=>focusInput(3)} onBlur={() => setInputIndex(null)}/>

                                              <span className='toggleShowPassword' onClick={ () => setIsShowConfirmPassword(!isShowConfirmPassword)}>
                                                {
                                                    isShowConfirmPassword == true ? < FaEyeSlash /> : <IoEyeSharp />
                                                }
                                                
                                            </span>
                                        </div>

                                        <FormControlLabel control={ <Checkbox /> } label="I agree to the all Terms & Condiotions"/>

                                        <div className='form-group'>
                                            <Button className='btn-blue btn-lg w-100 btn-big'>Sing up</Button>
                                        </div>

                                        <div className="form-group text-center mt-2">
                                         

                                            <div className='d-flex align-items-center justify-content-center or mt-3 mb-3'>
                                                <span className='line'></span>
                                                <span className='txt'>or</span>
                                                <span className='line'></span>
                                            </div>
                                            
                                            <Button variant='outlined' className='w-100 btn-lg loginWithGoogle btn-big'>
                                                <FaGoogle /> Sign in with Google
                                            </Button>


                                        </div>

                                    </form>
                                </div>


                                <span className='text-center d-block mt-3'>
                                        Don't have a account? 
                                        <Link to={'/login'} className='link color ml-5'>Sign In</Link>
                                </span>

                            </div>
                        </div>

                    </div>
                    
            
                </section>
            </>
    )

}
