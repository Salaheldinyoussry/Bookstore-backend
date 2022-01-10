// const { is } = require('express/lib/request');
// const pool = require('../DB/pool');
// const Post = require('../Models/Post')
// const PostLocation = require('../Models/PostLocation')
// const PostPhoto = require('../Models/PostPhoto')
// const PostTags = require('../Models/PostTags')
// const {uploadPhotosToAzure} = require('../Services/PhotoUpload')
// const atob = require('atob')
// const moment = require('moment') 
// module.exports = {

//    getFeedPosts: (req, res) => {
//       let limit = req.query.limit || 100;
//       let offset = req.query.offset || 0;

//       if (!req.user_id)
//          res.status(403)

//       let query = `user.email != '${req.user_id}'`;

//       Post.findAll(query, limit, offset, (err, posts) => {
//          if (err)
//             return res.status(500).json(err);
//          posts = formatPostsDate(posts)
//          console.log("MAMA")
//          console.log(posts)
//          return res.send(posts);
//       })

//    },

//    getProfilePosts: (req, res) => {
//       let limit = req.query.limit || 100;
//       let offset = req.query.offset || 0;

//       // var base64Url = req.body.email.split('.')[1];
//       // var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       // var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
//       //    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       // }).join(''));
//       // const email = JSON.parse(jsonPayload).email;


//       let query = `user.email = '${req.user_id}'`;

//       Post.findAll(query, limit, offset, (err, posts) => {

//          if (err)
//             return res.status(500).json(err);
//          posts = formatPostsDate(posts)
//          return res.status(200).json(posts);
//       })

//    },

//    getFeedPostsCount: (req, res) => {
//       let query = `user.email != '${req.user_id}'`;
//       Post.count(null, (err, count) => {

//          if (err)
//             return res.status(500).json(err);

//          return res.json(count);


//       })

//    },

//    deletePost: (req, res) => {
//       Post.getOne(req.query.id,(error, post)=>{

//          if(error)
//             return res.status(500).json(err);
         
//          if (!post|| !post.length || post[0].email != req.user_id){

//             return res.status(401).json({ error:true ,msg: "post doen't exist or that post doesn't belong to the loged user" });

//          }
//          Post.delete(req.query.id, (err) => {

//             if (err)
//                return res.status(500).json(err);
//             return res.json();


//          })
//       })

//    },


//    getPost: (req, res) => {
//       console.log("recieved")
//       console.log(req.params) 
//       var base64Url = req.params.token.split('.')[1];
//       var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
//          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       }).join(''));

//       const email = JSON.parse(jsonPayload);
//       const post_id = req.params.id;

//       Post.findOne(post_id, email.email, (err, post) => {
//          if (err){
//             console.log(err);
//             return res.status(500).json(err);
//          }
//          console.log(post);
//          return res.send(post);
//       })

//    },

//    createPost: async (req, res) => {
//       var base64Url = req.body.email.split('.')[1];
//       var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
//          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       }).join(''));
      
//       const email = JSON.parse(jsonPayload);
//       var post_id;
//       console.log("hi from photos")
//       await Post.createPost(email.email, req.body, (err, post) => {
//          post_id = post.insertId;
//       })
//       .then(() => {
//          uploadPhotosToAzure(req.body.photos)
//          PostPhoto.createPostPhoto(post_id, req.body.photos)
//          PostLocation.createPostLocation(post_id, req.body)
//          PostTags.createPostTags(post_id, req.body.tags)
//          console.log(post)
//          return
//       })
//       .then(() => {
//          console.log("hi")
//          console.log(photos)
//          PostPhoto.createPostPhoto(post_id, photos)
//          PostLocation.createPostLocation(post_id, req.body)
//          PostTags.createPostTags(post_id, req.body.tags)
//          console.log(post)
//          return
//       })

//       .then(() => {return res.status(200).json({})})

//       .catch((err) => {
//          return res.status(500).json(err);
//       });

//    },

//    editPost: async (req, res) => {
//       console.log("received");
//       var base64Url = req.body.email.split('.')[1];
//       var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
//          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       }).join(''));
//       const email = JSON.parse(jsonPayload);
//       const post_id = req.body.postId;
//       console.log(req.body.tags)
//       console.log(req.body.deletedTags)
//       await Post.editPost(email.email, req.body)
//       .then(() => {
//          PostPhoto.createPostPhoto(post_id, req.body.photos)
//          PostPhoto.deletePostPhoto(post_id, req.body.deletedPhotos)
//          PostTags.createPostTags(post_id, req.body.tags)
//          PostTags.deletePostTags(post_id, req.body.deletedTags)
//          PostLocation.editPostLocation(post_id, req.body)
//          console.log(post_id)
//          return 
//       })

//       .then(() => res.status(200).json({
         
//       }))

//          .catch((err) => {
//             return res.status(500).json(err);
//          });

//    }
   

// }

// function formatPostsDate(posts){
//    let asOfDate = moment(new Date())


//    posts.forEach(p=>{
//    let pDate = moment(p.created_at)
//    var diff = asOfDate.diff(pDate);
//    if(diff < 24 * 60 * 60 * 1000) {// less than 24 diff
//       if (diff < 60 * 60 * 1000){
//          p.created_at='less than 1h'
//          p.created_at = moment(diff).format("mm") + "m" 
//          p.created_at = p.created_at.charAt(0) == '0' ? p.created_at.substring(1) : p.created_at
//       }
//       else{
//          p.created_at = moment(diff).format("hh") + "h" 
//          p.created_at = p.created_at.charAt(0) == '0' ? p.created_at.substring(1): p.created_at
//       }
//    }else{
//       p.created_at = moment(p.created_at).format("MMM Do")
//    }

//    })
//    return posts;
// }