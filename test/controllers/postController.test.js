let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();
chai.use(chaiHttp);
const jwt = require("jsonwebtoken");
const DB = require("../../DB/pool");

describe('Posts controller', function () {

        describe('GET /posts/feed', function () {
            const tests = [
                {limit:10 , offset :0 },
                { limit: 10, offset :70 },
                { limit: 30, offset :20 },
                { limit: 50, offset :0 },
                { limit: 100, offset :70 },

            ];

            tests.forEach(t=>{
                it('it should retrun an array of the at most the specified size', (done) => {
                    chai.request(server)
                        .get(`/posts/feed?limit=${t.limit}&offset=${t.offset}`)
                        .set('authorization', process.env.TEST_TOKEN)
                        .send({ email: process.env.TEST_TOKEN })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.at.most(t.limit);

                            let posts = res.body ; 
                            posts.forEach (p=>{
                                p.should.have.property('userName');
                                p.should.have.property('body');
                                p.should.have.property('userPhoto');
                                p.should.have.property('photos');
                                p.should.have.property('email');

                            })

                            done();
                        });
                });

            })
        })
        describe('GET /posts/profilePosts', function () {
            const tests = [
                { limit: 10, offset: 0 },
                { limit: 10, offset: 70 },
                { limit: 30, offset: 20 },
                { limit: 50, offset: 0 },
                { limit: 100, offset: 70 },

            ];

            tests.forEach(t => {
                it('it should retrun an array of the at most the specified size with the test user email', (done) => {
                    chai.request(server)
                        .get(`/posts/profilePosts?limit=${t.limit}&offset=${t.offset}`)
                        .set('authorization', process.env.TEST_TOKEN)
                        .send({ email: process.env.TEST_TOKEN })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.at.most(t.limit);

                            let posts = res.body;
                            posts.forEach(p => {
                                p.should.have.property('userName');
                                p.should.have.property('body');
                                p.should.have.property('userPhoto');
                                p.should.have.property('photos');
                                p.should.have.property('email');
                                p.email.should.be.equal(process.env.TEST_EMAIL)

                            })

                            done();
                        });
                });

            })
        })

        describe('Delete /posts/delete', function () {
            this.timeout(20000);
            let testPost ={
                post_id:999999999,
                email: process.env.TEST_EMAIL ,
                body : "test t t t t t t t"
            } 

            it('it should delete post with its componennts', (done) => {

                let query = `insert  ignore into  POST(post_id,email, body) values(${testPost.post_id},'${process.env.TEST_EMAIL }','${testPost.body}');`
                DB(query).then(() => {
                    //done()
                    let testPhoto = {
                        photo: "htttp://test.com"
                    } 
                    console.log("inside  t")
                    let query2 = `insert  ignore into  postphoto(post_id ,photo) values('${999999999}','${testPhoto.photo}');`
                    DB(query2).then(()=>{

                            chai.request(server)
                                .delete(`/posts/delete?id=${999999999}`)
                                .set('authorization', process.env.TEST_TOKEN)
                                .send({ email: process.env.TEST_TOKEN })
                                .end((err, res) => {
                                    console.log(err)
                                    res.should.have.status(200);
                                    let query3 = `SELECT * FROM tourify.postphoto where post_id=${999999999};`
                            

                                    DB(query3).then((photos)=>{
                                        photos.length.should.be.equal(0)
                                        let query4 = `SELECT * FROM tourify.post where post_id=${999999999};`
                                        DB(query4).then((posts) => {
                                            posts.length.should.be.equal(0)
                                            done();
                                        })
                                   
                                    })
                                });
                        });
                        
                }).catch(e=>{
                    console.log(e)
                })

            
            })
            console.log("ddd")


        });
        
        describe('Delete /posts/delete', function () {
            this.timeout(20000);
            // let testPost = {
            //     post_id: 999999999,
            //     email: process.env.TEST_EMAIL,
            //     body: "test t t t t t t t"
            // }

            it('it should not  delete post of another user (return 401)', (done) => {

               // let query = `insert  ignore into  POST(post_id,email, body) values(${testPost.post_id},'${process.env.TEST_EMAIL}','${testPost.body}');`
               // DB(query).then(() => {
    
                        chai.request(server)
                            .delete(`/posts/delete?id=${1}`)
                            .set('authorization', process.env.TEST_TOKEN)
                            .send({ email: process.env.TEST_TOKEN })
                            .end((err, res) => {
                                console.log(err)
                                res.should.have.status(401);
                                done();
                            });
                    

               // }).catch(e => {
                 //   console.log(e)
               // })


            })


        });


        describe('GET /posts/feedCount', function () {
   
            it('it should retrun an array of the specified size', (done) => {
                chai.request(server)
                    .get(`/posts/feedCount`)
                    .send({ email: process.env.TEST_TOKEN})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.count.should.be.a('number');
                        done();
                    });
            });

        });

        describe('POST/posts/TripCreation', function () {
            const body = {
                email: process.env.TEST_TOKEN,
                body: "Hello",
                tags: ["hicking"],
                photos: ["photo1", "photo2"],
                organisation: "Trip Travel",
                rate: 5,
                budget: 2000,
                currency: "$",
                duration: 5,
                latitude: 32.5,
                longitude: 51
            };
            it('it should retrun Ok response', () => {
                chai.request(server)
                    .post(`/posts/TripCreation`)
                    .send(body)
                    .end((err, res) => {
                        res.should.have.status(200);
                        console.log(res);
                    });
            });

        });  
        
        
        describe('POST/posts/Edit', function () {
            const body = {
                postId: 2,
                email: process.env.TEST_TOKEN,
                body: "Hello",
                tags: ["hicking"],
                photos: ["photo1", "photo2"],
                organisation: "Trip Travel",
                rate: 5,
                budget: 2000,
                currency: "$",
                duration: 5,
                latitude: 32.5,
                longitude: 51
            };
            it('it should retrun Ok response', () => {
                chai.request(server)
                    .post(`/posts/posts/Edit`)
                    .send(body)
                    .end((err, res) => {
                        res.should.have.status(200);
                        console.log(res);
                    });
            });

        });   

      
        describe('GET/posts/:id/:token', function () { 
            it('it shoud return a specific post its id and user token are passed through parameters', (done) => {
                let query1 = `INSERT INTO Post
                (post_id,email, body, duration, organisation, rate, budget, currency, number_of_comments, number_of_likes)  VALUES
                (2,"${process.env.TEST_EMAIL}","postDescriotion",7,"Travel institution",3, 2000,"$", 0, 0 ) ;`;
                let query2 = `INSERT INTO PosTPhoto VALUE (2,${test.photo});`
                let query3 = `INSERT INTO PostTags VALUE (2,${test.tag});`
                let query4 = `INSERT INTO PostLocation VALUE (2,${test.latitude},${test.longitude});`

                let test = {
                    photo: "http://test.com",
                    tag: "Hicking",
                    latitude: 30.5,
                    longitude: 50.5,
                }
                DB(query1).then(() => {
                    DB(query2)})
                .then(() => {
                    DB(query3)})
                .then(() => {
                    DB(query4) })                             
                .then(() =>{
                            done()
                            chai.request(server)
                            .get(`/posts/2/${process.env.TEST_TOKEN}`)
                            .set('authorization', process.env.TEST_TOKEN)
                            .send({ email: process.env.TEST_TOKEN })
                            .end((err, res) => {
                                console.log(err)
                                console.log("in end")
                                res.should.have.status(200);
                                let query5 = `SELECT
                                body, duration, organisation, rate, budget, currency, latitude, longitude, photos, tags
                                FROM
                                    (Post NATURAL LEFT JOIN PostLocation)
                                    LEFT JOIN (
                                        SELECT 
                                            post_id, 
                                            JSON_ARRAYAGG(photo) photos 
                                        FROM PostPhoto 
                                        GROUP BY post_id
                                        ) ph ON Post.post_id = ph.post_id
                                    LEFT JOIN (
                                        SELECT 
                                        post_id, 
                                        JSON_ARRAYAGG(tag_name) tags 
                                        FROM PostTags 
                                        GROUP BY post_id
                                    ) t ON Post.post_id = t.post_id
                                WHERE Post.post_id = 2 AND email = "${process.env.TEST_EMAIL}" `

                                DB(query5).then((post)=>{
                                    post.body.should.be.equal("postDescriotion")
                                    post.duration.should.be.equal(7)
                                    post.organisation.should.be.equal("Travel institution")
                                    post.rate.should.be.equal(3)
                                    post.budget.should.be.equal(2000)
                                    post.currency.should.be.equal("$")
                                    post.latitude.should.be.equal(30)
                                    post.longitude.should.be.equal(50)
                                    post.photos.length.should.be.equal(1)
                                    post.tags.length.should.be.equal(1)
                                    done();
                                    })
                                });
                }).catch(e=>{
                    console.log(e)
                })
        });
});
            


});   

   





