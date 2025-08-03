import { useEffect, useContext, useState } from 'react';
import Logo from '../../assets/images/logo.webp';
import pattern from '../../assets/images/pattern.webp';
import { MyContext } from '../../App';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { actionFormStore, getAuth } from '../../store/authStore/authStoreActions.js'; 
import { useNavigate } from 'react-router-dom';


export const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { username, password, isLogin } = useSelector((state) => state.authStore);
    
    const [inputIndex, setInputIndex]         = useState(null);
    const [isShowPassword, setIsShowPassword] =  useState(false);

    const context = useContext(MyContext)

    const [errors, setErrors] = useState({});
    
    const validateForm = () => {
        const newErrors = {};
        if (!username.trim()) newErrors.username = 'Campo requerido';
        if (!password.trim()) password.password = 'Campo requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        context.setIsHideSideBarAndHeader(true);
    },[])

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const handleChange = (e) => {
        dispatch(actionFormStore(e.target));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        dispatch(getAuth(username, password, navigate));
    };


    return (
            <>
                <img src={pattern} className='loginPattern' />
                <section className="loginSection">
                    <div className="loginBox">
                        <div className="logo text-center">
                            <img src={Logo} width="60px" />
                            <h5 className='font-weight-bold'>Login</h5>
                        </div>

                        <div className='wrapper mt-3 card border p-4'>

                            <form onSubmit={handleSubmit}>
                                <div className={`form-group position-relative ${ inputIndex == 0 && 'focus'}`}>
                                    <span className='icon'>
                                        <MdEmail/>
                                    </span>
                                    <input type="text" 
                                                name="username" 
                                                value={username}
                                                className='form-control' 
                                                placeholder='Enter your User' 
                                                onFocus={()=>focusInput(0)} 
                                                onBlur={() => setInputIndex(null)}
                                                onChange={handleChange}
                                                error={!!errors.username}/>
                                </div> 


                                <div className={`form-group position-relative ${ inputIndex == 1 && 'focus'}`}>
                                   
                                    <span className='icon'>
                                        <RiLockPasswordFill/>
                                    </span>

                                    <input type={`${isShowPassword==true ? 'text' : 'password'}`} 
                                                name="password" 
                                                className='form-control'
                                                placeholder='Enter your password' 
                                                value={password}
                                                onFocus={()=>focusInput(1)} 
                                                onBlur={() => setInputIndex(null)}
                                                onChange={handleChange}
                                                error={!!errors.password}/>
                                        
                                    <span className='toggleShowPassword' onClick={ () => setIsShowPassword(!isShowPassword)}>
                                        {
                                            isShowPassword == true ? < FaEyeSlash /> : <IoEyeSharp />
                                        }   
                                    </span>
                                </div>

                                <div className='form-group'>
                                    <Button className='btn-blue btn-lg w-100 btn-big' type='submit'>Sing in</Button>
                                </div>

                            </form>
                        </div>

                    </div>
                </section>
            </>
    )

}
