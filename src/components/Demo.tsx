import React from "react";
import Script from "next/script";

const Demo = () => {
  return (
    <>
      <Script src="https://js.storylane.io/js/v1/storylane.js"></Script>
      <div
        className="sl-embed"
        style={{
          position: "relative",
          paddingBottom: "calc(50.36% + 25px)",
          width: "100%",
          height: "0",
          transform: "scale(1)",
        }}
      >
        <iframe
          loading="lazy"
          className="sl-demo !w-full !h-full ring-1 ring-gray-900/30"
          src="https://app.storylane.io/demo/xrlbiaoeyyky"
          name="sl-embed"
          allow="fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            boxShadow: "0px 0px 18px rgba(26, 19, 72, 0.15)",
            borderRadius: "10px",
            boxSizing: "border-box",
          }}
        ></iframe>
      </div>
    </>
  );
};

export default Demo;
