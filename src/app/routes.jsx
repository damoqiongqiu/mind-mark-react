import React, { lazy } from "react";
import ChatLayout from "./chat-layout";
import Exception404 from "./shared/exception/404";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const KnowledgeMain = lazy(() =>
  import(/*webpackChunkName:'knowledge-main',webpackPrefetch:true*/ "./knowledge/main-page")
);
const Knowledge = lazy(() =>
  import(/*webpackChunkName:'knowledge',webpackPrefetch:true*/ "./knowledge")
);
const EditDbConnection = lazy(() =>
  import(/*webpackChunkName:'edit-dbconnection',webpackPrefetch:true*/ "./knowledge/db-manage/db-connection/edit-form")
);
const SchemaTable = lazy(() =>
  import(/*webpackChunkName:'schema-table',webpackPrefetch:true*/ "./knowledge/db-manage/schema-table")
);
const EditSchemaTable = lazy(() =>
  import(/*webpackChunkName:'edit-schema-table',webpackPrefetch:true*/ "./knowledge/db-manage/schema-table/edit-form")
);
const Manage = lazy(() =>
  import(/*webpackChunkName:'manage',webpackPrefetch:true*/ "./manage")
);
const Chart = lazy(() =>
  import(/*webpackChunkName:'chart',webpackPrefetch:true*/ "./manage/chart")
);
const UserTable = lazy(() =>
  import(/*webpackChunkName:'user-table',webpackPrefetch:true*/ "./manage/permission/user-table")
);
const UserProfile = lazy(() =>
  import(/*webpackChunkName:'user-profile',webpackPrefetch:true*/ "./manage/permission/user-profile")
);
const RoleTable = lazy(() =>
  import(/*webpackChunkName:'role-table',webpackPrefetch:true*/ "./manage/permission/role-table")
);
const RoleEdit = lazy(() =>
  import(/*webpackChunkName:'role-edit',webpackPrefetch:true*/ "./manage/permission/role-edit")
);
const ApiPermissionTable = lazy(() =>
  import(/*webpackChunkName:'api-permission-table',webpackPrefetch:true*/ "./manage/permission/api-permission-table")
);
const ApiPermissionEdit = lazy(() =>
  import(/*webpackChunkName:'api-permission-edit',webpackPrefetch:true*/ "./manage/permission/api-permission-edit")
);
const ComponentPermissionTable = lazy(() =>
  import(/*webpackChunkName:'component-permission-table',webpackPrefetch:true*/ "./manage/permission/component-permission-table")
);
const ComponentPermissionEdit = lazy(() =>
  import(/*webpackChunkName:'component-permission-edit',webpackPrefetch:true*/ "./manage/permission/component-permission-edit")
);
const SignIn = lazy(() =>
  import(/*webpackChunkName:'sign-in',webpackPrefetch:true*/ "./user/sign-in")
);
const SignUp = lazy(() =>
  import(/*webpackChunkName:'sign-up',webpackPrefetch:true*/ "./user/sign-up")
);
const RetrievePwd = lazy(() =>
  import(/*webpackChunkName:'retrieve-pwd',webpackPrefetch:true*/ "./user/retrieve-pwd")
);

export default props => {
  const sessionUser = useSelector((state) => state.session.user);

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
      path: "/sign-in",
      element: SignIn,
    },
    {
      path: "/sign-up",
      element: SignUp,
    },
    {
      path: "/retrieve-pwd",
      element: RetrievePwd,
    },
    {
      path: "/knowledge",
      element: Knowledge,
      redirect: !sessionUser ? "/sign-in" : null,
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
      path: "/manage",
      element: Manage,
      redirect: !sessionUser ? "/sign-in" : null,
      children: [
        {
          path: "chart",
          element: Chart,
        },
        {
          path: "user-table/page/:page",
          element: UserTable,
        },
        {
          path: "user-profile/:userId",
          element: UserProfile,
        },
        {
          path: "role-table/page/:page",
          element: RoleTable,
        },
        {
          path: "role-edit/:roleId",
          element: RoleEdit,
        },
        {
          path: "api-permission-table/page/:page",
          element: ApiPermissionTable,
        },
        {
          path: "api-permission-edit/:apiPermissionId",
          element: ApiPermissionEdit,
        },
        {
          path: "component-permission-table/page/:page",
          element: ComponentPermissionTable,
        },
        {
          path: "component-permission-edit/:compPermId/:pId",
          element: ComponentPermissionEdit,
        },
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