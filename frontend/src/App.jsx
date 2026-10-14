import {Routes, Route,Navigate} from "react-router";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
// import AdminPanel from "./pages/AdminPanel"
import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import AdminUpdate from "./components/AdminUpdate";
import Profile from "./pages/Profile";



function App(){

  // code to check if the user is already authenticated or not 
  const {isAuthenticated, user,loading} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  return(
    <>
      <Routes>
        <Route path="/" element = {isAuthenticated ? <HomePage></HomePage>:<Navigate to="/signup"/>}></Route>
        <Route path="/login" element = {isAuthenticated ?<Navigate to= "/"/>: <Login></Login>}></Route>
        <Route path="/signup" element = {isAuthenticated ?<Navigate to ="/"/> :<Signup></Signup>}></Route>
        <Route path="/profile" element={isAuthenticated ? <Profile/> : <Navigate to="/login" replace/>}></Route>
        <Route path="/admin" element={isAuthenticated && user?.role === "admin" ? <Admin/> : <Navigate to="/" replace/>}></Route>
        <Route path="/admin/create" element={isAuthenticated && user?.role === "admin" ? <AdminPanel/> : <Navigate to="/" replace/>}></Route>
        <Route path="/admin/update" element={isAuthenticated && user?.role === "admin" ? <AdminUpdate/> : <Navigate to="/" replace/>}></Route>
        <Route path="/admin/delete" element={isAuthenticated && user?.role === "admin" ? <AdminDelete/> : <Navigate to="/" replace/>}></Route>
        <Route path="/problemPage/:problemId" element={<ProblemPage/>}></Route>
        {/* <Route path = "/problemPage" element = {isAuthenticated ?<Navigate to ="/"/>:<ProblemPage></ProblemPage>}></Route> */}
      </Routes>
    </>
  )
}

export default App;
