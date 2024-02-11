import React, { FormEvent, useRef } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";
import cookies from "js-cookie";
import "./Signup.scss";
import { ApiService } from "../../services/api.service";
import { getTokenExpireDate } from "../../utils/token-expire";

export const Signup: React.FunctionComponent = () => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  async function onSubmitSignup(event: FormEvent) {
    event.preventDefault();
    removeInvalidClass();
    const validationResult = validateUserInput();

    if (validationResult.length) {
      for (const err of validationResult) {
        toast.error(err);
      }
      return;
    }

    const firstName = firstNameRef.current!.value,
      lastName = lastNameRef.current!.value,
      email = emailRef.current!.value,
      password = passwordRef.current!.value;

    const jwt = await ApiService.signup({
      firstName,
      lastName,
      email,
      password,
    });
    if (jwt.statusCode) {
      toast.error(jwt.message);
      return;
    }
    cookies.set("jwt", jwt, { secure: true, expires: getTokenExpireDate() });
    (event.target as HTMLFormElement).reset();
    toast.success("You successfully signed up!");
    navigate("/");
  }

  function removeInvalidClass(): void {
    firstNameRef.current!.classList.remove("invalidInput");
    lastNameRef.current!.classList.remove("invalidInput");
    emailRef.current!.classList.remove("invalidInput");
    passwordRef.current!.classList.remove("invalidInput");
    confirmPasswordRef.current!.classList.remove("invalidInput");
  }

  function validateUserInput(): string[] {
    let arr = [] as string[];
    if (firstNameRef.current!.value.length < 3) {
      firstNameRef.current!.classList.add("invalidInput");
      arr.push("First name must be at least 3 symbols!");
    }
    if (lastNameRef.current!.value.length < 3) {
      lastNameRef.current!.classList.add("invalidInput");
      arr.push("First name must be at least 3 symbols!");
    }
    if (!validator.isEmail(emailRef.current!.value)) {
      emailRef.current!.classList.add("invalidInput");
      arr.push("Invalid email address!");
    }
    if (passwordRef.current!.value.length < 4) {
      passwordRef.current!.classList.add("invalidInput");
      arr.push("Password name must be at least 4 symbols!");
    }
    if (confirmPasswordRef.current!.value.length < 4) {
      confirmPasswordRef.current!.classList.add("invalidInput");
      arr.push("Confirm password name must be at least 4 symbols!");
    }
    if (passwordRef.current!.value !== confirmPasswordRef.current!.value) {
      passwordRef.current!.classList.add("invalidInput");
      confirmPasswordRef.current!.classList.add("invalidInput");
      arr.push("Password and confirm password must be the same!");
    }
    return arr;
  }

  if (cookies.get("jwt")) return <Navigate to="/" />;

  return (
    <div className="mainDivSignup">
      <div className="authDiv">
        <div className="title">
          <h1>Welcome</h1>
          <h5>Let's create your account!</h5>
        </div>
        <form onSubmit={onSubmitSignup}>
          <div className="inputContainer">
            <input
              ref={firstNameRef}
              type="text"
              id="firstName"
              placeholder=" "
            />
            <div className="cut"></div>
            <label htmlFor="firstName" className="placeholder">
              First Name
            </label>
          </div>
          <div className="inputContainer">
            <input
              ref={lastNameRef}
              type="text"
              id="lastName"
              placeholder=" "
            />
            <div className="cut"></div>
            <label htmlFor="lastName" className="placeholder">
              Last Name
            </label>
          </div>
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
          <div className="inputContainer">
            <input
              ref={confirmPasswordRef}
              type="password"
              id="confirmPassword"
              placeholder=" "
            />
            <div className="cut cutLong"></div>
            <label htmlFor="confirmPassword" className="placeholder">
              Confirm Password
            </label>
          </div>
          <button type="submit" className="submit">
            Create account
          </button>
        </form>
        <div className="authFooter">
          <p>Already have an account?</p>
          <Link to="/signin">Log In</Link>
        </div>
      </div>
    </div>
  );
};
