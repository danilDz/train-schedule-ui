import React, { FormEvent, useRef } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";
import cookies from "js-cookie";
import "./Signin.scss";
import { ApiService } from "../../services/api.service";
import { getTokenExpireDate } from "../../utils/token-expire";

///
/// FR - Add an ability to NOT remember user with Session Storage instead of Cookie
///

export const Signin: React.FunctionComponent = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

    const email = emailRef.current!.value,
      password = passwordRef.current!.value;

    const responseObj = await ApiService.signin({
      email,
      password,
    });
    if (responseObj.statusCode) {
      toast.error(responseObj.message);
      return;
    }
    cookies.set("jwt", responseObj.jwt, {
      secure: true,
      expires: getTokenExpireDate(),
    });
    (event.target as HTMLFormElement).reset();
    toast.success("You successfully logged in!");
    navigate("/");
  }

  function removeInvalidClass(): void {
    emailRef.current!.classList.remove("invalidInput");
    passwordRef.current!.classList.remove("invalidInput");
  }

  function validateUserInput(): string[] {
    let arr = [] as string[];
    if (!validator.isEmail(emailRef.current!.value)) {
      emailRef.current!.classList.add("invalidInput");
      arr.push("Invalid email address!");
    }
    if (passwordRef.current!.value.length < 4) {
      passwordRef.current!.classList.add("invalidInput");
      arr.push("Password must be at least 4 symbols!");
    }
    return arr;
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
