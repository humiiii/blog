import React, { useEffect, useRef, useState } from "react";

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  let activeTabLineRef = useRef();
  let activeTabRef = useRef();

  const changePageState = (btn, index) => {
    if (!btn || !activeTabLineRef.current) return;
    const { offsetWidth, offsetLeft } = btn;

    activeTabLineRef.current.style.width = `${offsetWidth}px`;
    activeTabLineRef.current.style.left = `${offsetLeft}px`;

    setInPageNavIndex(index);
  };

  useEffect(() => {
    if (activeTabRef.current) {
      changePageState(activeTabRef.current, defaultActiveIndex);
    }
  }, [defaultActiveIndex]);

  return (
    <>
      <div className="border-gray relative mb-8 flex flex-nowrap overflow-x-auto border-b bg-white">
        {routes.map((route, index) => (
          <button
            ref={index == defaultActiveIndex ? activeTabRef : null}
            key={index}
            className={`p-4 px-5 capitalize ${inPageNavIndex == index ? "text-black" : "text-dark-gray"} ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
            onClick={(e) => changePageState(e.target, index)}
          >
            {route}
          </button>
        ))}
        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 bg-black transition-all duration-300"
        />
      </div>
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
