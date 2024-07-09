import "./post.css";
import { MoreVert } from "@material-ui/icons";
import DeleteIcon from '@material-ui/icons/Delete'
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Post({ post, onDeletePost }) {
  const [like, setLike] = useState(post.likes.length);
  // const [postsnew, updatePosts] = useState({})
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const PF = "http://localhost:8800/images/";
  const { user: currentUser } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false)
  const [comment, setComment] =useState([])
  const commentEntered = useRef()

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:8800/api/users?userId=${post.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await axios.get(`http://localhost:8800/api/posts/${post._id}`);
      console.log(res.data.comment)
      setComment(res.data.comment);
    };
    fetchComments();
  }, [post._id]);
  // const postIdRef = useRef(null)

  // useEffect(()=>{
  //   postIdRef.current = post._id
  // }, [post])

  const likeHandler = () => {
    try {
      axios.put("http://localhost:8800/api/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const deletePost = async () => {
    try {
     await axios.delete(`http://localhost:8800/api/posts/${post._id}`,{data:{userId:currentUser._id}})
    //  console.log(backenddata, "from Post")
    //  setPosts(posts.filter(item => item._id !== post._id))
    //  console.log(updatedPosts)
    onDeletePost(post._id)
    console.log(post._id + "id deleted")
    }catch(err){
      console.log(err)
    }
  }

  const commentPost = async (e) => {
    e.preventDefault()
    try {
      setShowDropdown(!showDropdown)
    }catch(err){
      console.log(err)
    }
    
  }

    const submitComment = async (e) =>{
      e.preventDefault()
      try{
        await axios.put(`http://localhost:8800/api/posts/comment/${post._id}`, { userId: currentUser._id, username: currentUser.username, comment:commentEntered.current.value })
        setComment([...comment, {username: currentUser.username, comment: commentEntered.current.value}])
        commentEntered.current.value = ''
      }catch(err){
        console.log(err)
      }
    }
     
  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ?  user.profilePicture
                    :  "person/noAvatar.png"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            <MoreVert />
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={PF + post.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
            <div className="likeIcon">
              <DeleteIcon onClick={deletePost}/>
              </div>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText" onClick={commentPost}> comments</span>
            {showDropdown && (
              <ul >
                <li><input ref = {commentEntered} placeholder="Please enter Comment" ></input><button onClick={submitComment}>Comment</button></li>
                {Array.isArray(comment) && (comment.map((commentItem)=>(<li key={commentItem.username}>{commentItem.username}:{commentItem.comment}</li>)))}
                
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
