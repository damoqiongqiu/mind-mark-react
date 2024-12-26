import React, { lazy, useState } from "react";
import MainLayout from "./main-layout";
import Chat from "./chat";
import Exception404 from "./shared/exception/404";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const Knowledge = lazy(() => import(/*webpackChunkName:'knowledge',webpackPrefetch:true*/ "./knowledge"));

export default props => {
  const sessionUser = useSelector((state) => state.session.user);

  const routes = [
    {
      path: "/",
      element: Navigate,
      redirect: "/home/chat",
    },
    {
      path: "/home",
      element: MainLayout,
      children: [
        {
          path: "chat",
          element: Chat,
        },
      ]
    },
    {
      path: "chat",
      element: Chat,
    },
    {
      path: "knowledge",
      element: Knowledge,
    },
    {
      path: "*",
      element: Exception404,
    },
  ];

  /**
   * 递归渲染路由。
   * @param {*} routes Tree node, with children to be rendered recursively.
   * @returns 
   */
  const doRenderRoutes = (routes) => {
    return routes.map((route) => {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.redirect ? (
              <>
                <Navigate to={`${route.redirect}`} replace />
              </>
            ) : (
              <route.element />
            )
          }
        >
          {route.children && doRenderRoutes(route.children)}
        </Route>
      );
    });
  };

  return (
    <Routes>
      {doRenderRoutes(routes)}
    </Routes>
  );
}