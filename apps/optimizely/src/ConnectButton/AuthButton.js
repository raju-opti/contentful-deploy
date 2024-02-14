import React from "react"
import OptimizelyLogo from "../optimizely-logo";
const AuthButton = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox='0 0 245 40'
      width={245} height={40}
      {...props}
    >
      <title>
        ConnectWithOptimizelyButton
      </title>
      <rect width="245" height="40" x="0" y="0" rx="8" ry="8" fill="#000066" />
      <g transform={"translate(5, 2)"}>
          <OptimizelyLogo width={"35"} height={"35"}/>
      </g>
      <g transform={"translate(40, 22)"}>
          <text x={0} y ={5} fill={'white'} fontSize={"18"}> Connect with Optimizely </text>
      </g>
    </svg>
  )
};

export default AuthButton;
