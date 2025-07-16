import React from "react";
import PageAnimation from "../components/page.animation";
import InPageNavigation from "../components/InPageNavigation.component";

const HomePage = () => {
  return (
    <PageAnimation>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <h1>inside InPageNavigation</h1>
            <h1>inside InPageNavigation 2</h1>
          </InPageNavigation>
        </div>
        <div className=""></div>
      </section>
    </PageAnimation>
  );
};

export default HomePage;
