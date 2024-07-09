import "./topbar.css";
import { Search, Person, Chat, Notifications,  } from "@material-ui/icons";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Link, Redirect, useHistory } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Login from "../../pages/login/Login";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);
  const PF = "http://localhost:8800/images/";
  const [userfound, setuserfound] = useState('')
  const [searchInput, setSearchInput] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const history = useHistory()

  // console.log(user.profilePicture)

  const handleLogout = () => {
    logout();
  };

  const searchUser = async(e) =>{
    if(e.key === 'Enter') {
    e.preventDefault();
    // setuserfound(e.target.value)
    const userInput = e.target.value;
    //  console.log(userInput + "line no 26")
  try {
    const res = await fetch(`http://localhost:8800/api/users/search?username=${userInput}`, 
      // http://localhost:8800/api/users?username=${userInput}
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(data)
    const userData = Array.isArray(data) ? data : [data];
    console.log(userData)
    setuserfound(userData);
    setSearchInput(`${userData[0].username}`)
    setShowDropdown(true)
    console.log(data[0].username) 
  } catch (err) {
    console.error(err);
  }
    // try{
    //   fetch(`http://localhost:8800/api/users/${userfound}`)
    //   .then(response => response.json())
    //   .then(data => console.log(data))
    // }catch(err){
    //   console.log(err)
    // }
  }
}

const handleInputChange = (e) =>{
  setSearchInput(e.target.value)
  if(e.target.value.length>0){
    setShowDropdown(true)
  } else {
    setShowDropdown(false)
  }
}

const handleDropdownClick = (username) => {
  setSearchInput(username)
  setShowDropdown(false)
}

const handleClick = (username) =>{
  history.push(`/profile/${username}`)
  // history.push('/profile/${username}')
}
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Facebook</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input onKeyDown={searchUser}
            placeholder="Search for friend, post or video"
            className="searchInput"
            value={searchInput || ''} 
            onChange={handleInputChange}
          />
          {showDropdown && (
            <ul className="dropdown-list">
              {Array.isArray(userfound) ? (userfound.map((user) => (
                <li key={user.username} onClick={() => handleDropdownClick(user.username)}>
                  <img src={user.profilePicture} alt = {user.username} style={{width:30, height: 30, rondRadius: 50, marginRight: 10}}/>
                <span onClick={()=>handleClick(user.username)}>
                 {user.username}  </span> 
                {/* {onClick = () =>(<Link
              to={"/profile/" + user.username}
              style={{ textDecoration: "none" }}
            ></Link>  )} */}
            {/* <Redirect to = "/profile"/> */}
                </li>
              ))
            ) : (<li>No users found</li>)}
            </ul>
          )}
          {/* {userfound && (
            <img src= {userfound.profilePicture}
            alt={userfound.username}
            style={{width:30, height: 30}}/>
          )} */}
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink">Homepage</span>
          <span className="topbarLink">Timeline</span>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
          <ExitToAppIcon onClick={handleLogout} />
            {/* onclick= {<Redirect to ={<Login/>}/>} */}
            <span className="topbarImg"></span>
          </div>
        </div>
        <Link to={`/profile/${user.username}`}>
        {/* {fetch('http://localhost:8800/api/users/search?username=${userInput}`) */}
           <img
            src={
              user.profilePicture
                ? user.profilePicture
                :  "person/noAvatar.png"
                // ${PF}${user.profilePicture}
            }
            alt=""
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
}
