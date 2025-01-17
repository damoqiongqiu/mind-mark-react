import { createSlice } from '@reduxjs/toolkit'

// 从localStorage中获取当前用户数据
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// 创建会话管理的Redux切片
export const sessionSlice = createSlice({
  name: 'session',
  // 使用localStorage中的用户数据初始化状态
  initialState: { user: currentUser },
  reducers: {
    // 处理用户登录
    // 更新状态中的用户数据并保存到localStorage
    signIn: (state, action) => {
      state = {
        ...state,
        user: { ...action.payload }
      }
      localStorage.setItem("currentUser", JSON.stringify(state.user));
      return state;
    },
    // 处理用户登出
    // 从状态和localStorage中删除用户数据
    signOut: (state, action) => {
      let newState = { ...state };
      delete newState.user;
      state = {
        ...newState
      }
      localStorage.removeItem("currentUser");
      return state;
    }
  },
})

// 导出action创建器
export const { signIn, signOut } = sessionSlice.actions

// 导出reducer
export default sessionSlice.reducer