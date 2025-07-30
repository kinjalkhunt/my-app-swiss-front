import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { router } from "../../../Router";

const Content = () => {
    return (
        <Suspense fallback={<div className="flex justify-center bg-[#1a2c38]">Loading...</div>}>
            <Routes>
                {router.map((route, index) => {
                    return (
                        route.element && (
                            <Route
                                key={index}
                                path={route.path}
                                exact={route.exact}
                                name={route.name}
                                element={<route.element />}
                            />
                        )
                    );
                })}
                <Route path="/" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default Content;