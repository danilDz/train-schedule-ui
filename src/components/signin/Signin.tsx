import React, { FormEvent, useRef } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import validator from "validator";
import cookies from "js-cookie";
import { ApiService } from "../../services/api.service";
import "./Signin.scss";

export const Signin: React.FunctionComponent = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  async function onSubmitSignup(event: FormEvent): Promise<void> {
    event.preventDefault();
    removeInvalidClass();

    if (validateUserInput() === false) return;

    const email = emailRef.current!.value,
      password = passwordRef.current!.value;

    const jwt = await ApiService.signin({
      email,
      password,
    });
    if (jwt.statusCode) {
      console.log(jwt);
      return;
    }
    cookies.set("jwt", jwt, { secure: true, expires: 1 / 24 });
    (event.target as HTMLFormElement).reset();
    navigate("/");
  }

  function removeInvalidClass(): void {
    emailRef.current!.classList.remove("invalidInput");
    passwordRef.current!.classList.remove("invalidInput");
  }

  function validateUserInput(): boolean {
    let flag = true;
    if (!validator.isEmail(emailRef.current!.value)) {
      emailRef.current!.classList.add("invalidInput");
      flag = false;
    }
    if (passwordRef.current!.value.length < 4) {
      passwordRef.current!.classList.add("invalidInput");
      flag = false;
    }
    return flag;
  }

  if (cookies.get("jwt")) return <Navigate to="/" />;

  return (
    <div className="mainDivSignin">
      <div className="authDiv">
        <div className="title">
          <h1>Hi there!</h1>
        </div>
        <form onSubmit={onSubmitSignup}>
          <div className="inputContainer">
            <input ref={emailRef} type="text" id="email" placeholder=" " />
            <div className="cut cutMiddle"></div>
            <label htmlFor="email" className="placeholder">
              Email Address
            </label>
          </div>
          <div className="inputContainer">
            <input
              ref={passwordRef}
              type="password"
              id="password"
              placeholder=" "
            />
            <div className="cut"></div>
            <label htmlFor="password" className="placeholder">
              Password
            </label>
          </div>
          <button type="submit" className="submit">
            Log In
          </button>
        </form>
        <div className="authFooter">
          <p>Don't have an account?</p>
          <Link to="/signup">Register</Link>
        </div>
      </div>
    </div>
  );
};