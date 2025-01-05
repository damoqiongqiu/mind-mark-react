import React, { lazy } from "react";
import ChatLayout from "./chat-layout";
import Exception404 from "./shared/exception/404";
import { Routes, Route, Navigate } from "react-router-dom";

const Knowledge = lazy(() => import(/*webpackChunkName:'knowledge',webpackPrefetch:true*/ "./knowledge"));
const KnowledgeMain = lazy(() => import(/*webpackChunkName:'knowledge-main',webpackPrefetch:true*/ "./knowledge/main-page"));
const EditDbConnection = lazy(() => import(/*webpackChunkName:'edit-dbconnection',webpackPrefetch:true*/ "./knowledge/db-manage/db-connection/edit-form"));
const SchemaTable = lazy(() => import(/*webpackChunkName:'schema-table',webpackPrefetch:true*/ "./knowledge/db-manage/schema-table"));
const EditSchemaTable = lazy(() => import(/*webpackChunkName:'edit-schema-table',webpackPrefetch:true*/ "./knowledge/db-manage/schema-table/edit-form"));

export default props => {
  // const sessionUser = useSelector((state) => state.session.user);

  const routes = [
    {
      path: "/",
      element: Navigate,
      redirect: "/chat",
    },
    {
      path: "/chat",
      element: ChatLayout,
    },
    {
      path: "/knowledge",
      element: Knowledge,
      children: [
        {
          path: "",
          element: Navigate,
          redirect: "/knowledge/main",
        },
        {
          path: "main",
          element: KnowledgeMain,
        },
        {
          path: "db-connection/:id?",
          element: EditDbConnection,
        },
        {
          path: "schema-table/:dbId",
          element: SchemaTable,
        },
        {
          path: "schema-table/:dbId/new",
          element: EditSchemaTable,
        },
        {
          path: "schema-table/:dbId/edit/:id",
          element: EditSchemaTable,
        }
      ],
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