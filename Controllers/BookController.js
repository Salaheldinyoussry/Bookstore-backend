
const DB = require("../DB/pool");
const _ = require('lodash')
const async = require('async');
module.exports = {
    get: async (req, res) => {
        let search = req.query.search;
    

        try {
            let query = `select 
            isbn, title, publication_year, price, publisher_id, threshold, category, number_of_copies, publisher.name as publisherName, address, telephone, book_isbn, author_id, author.name
            from book 
            left join publisher on book.publisher_id = publisher.id
            left join book_author  on book.isbn = book_author.book_isbn
            left join author   on book_author.author_id =author.id
           ${ search ? ` where title = '${search}' or  isbn = '${search}' or category = '${search}' or publisher.name = '${search}' ` :''}
            ;
            `
            let data = await DB(query);

           
            let books = _.chain(data)
                .groupBy("isbn")
                .value()

            const arr = Object.keys(books).map(key => ({ key, value: books[key] }));
            console.log(arr);

            return res.json(arr);

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },
    addTocart: async (req, res) => {
        let cartItem = {
            book_isbn : req.body.isbn,
            userEmail : req.body.email
        }

        try {
            let query = `insert into cart (book_isbn , userEmail) values 
            (${cartItem.book_isbn},'${cartItem.userEmail}') 

            ;
            `
               await DB(query);

            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },
    getCart: async (req, res) => {

        try {
            let query = `select 
            isbn, title, publication_year, price, publisher_id, threshold, category, number_of_copies, publisher.name as publisherName, address, telephone, cart.book_isbn, author_id, author.name
            from  cart 
            join book  on book.isbn = cart.book_isbn
            left join publisher on book.publisher_id = publisher.id
            left join book_author  on book.isbn = book_author.book_isbn
            left join author   on book_author.author_id =author.id
            where cart.userEmail = '${req.query.email}' 
            ;
            `
            let data = await DB(query);


            let books = _.chain(data)
                .groupBy("isbn")
                .value()

            const arr = Object.keys(books).map(key => ({ key, value: books[key] }));
            console.log(arr);

            return res.json(arr);

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },

    removeFromCart: async (req, res) => {
        let cartItem = {
            book_isbn: req.query.isbn,
            userEmail: req.query.email
        }

        try {
            let query = `delete from cart  
            where book_isbn = ${cartItem.book_isbn} and userEmail = '${cartItem.userEmail}'
            ;
            `
            await DB(query);

            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },

    
    checkoutCart: async (req, res) => {
        if(!req.body.cardNo || ! req.body.exp)
            return res.status(402).json({ err: 'necessary parameter(s) are missing' });
        
        let email = req.query.email;
        try {
            let query = `select *  from cart  
            where userEmail = '${email}'
            ;
            `
            let items = await DB(query);
            
            async.each(items, function (item, callback) {

                let q2 = `UPDATE book SET number_of_copies = number_of_copies - 1 WHERE isbn = ${item.book_isbn}`
                let q9 = `insert into purchase (user_email ,  book_isbn) values ('${email}', ${item.book_isbn})`
                DB(q2).then(()=>{

                    DB(q9).then(()=>{
                        callback(null)

                    }).catch(e=>{
                        callback(e);
                    })

                }).catch(e=>{
                    callback(e);
                })

            }, function (err) {
                //If any of the user creation failed may throw error.
                if (err) {
                    console.log(err)
                    return res.status(500).json({ err: err });
     
                } else {
                    

                    let q3 = `delete   from cart  
                                where userEmail = '${email}'
                    
                                `
                    DB(q3).then(() => {
                        return res.json();
                    }).catch(e => {
                        return res.status(500).json({ err: e });
                    })
                   
                }
            });

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
            
        }

    },

    getOrders: async (req, res) => {

        try {
            let query = `select * from book_order
            join Book on Book.isbn = book_order.book_isbn  
            
            ;
            `
            let orders = await DB(query);

            return res.json(orders);

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },

    addOrder: async (req, res) => {
       
        try {
            let query = ` insert into book_order (book_isbn , user_email , quantity)
             values (${req.body.isbn} , '${req.body.email}' , ${req.body.quantity})
            ;
            `
            await DB(query);

            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },
    add: async (req, res) => {

        try {
   
            let q = `select * from publisher where name = '${ req.body.publisher}'`
            let publisherID;

            let  publisher = await DB(q);
            if(publisher.length){
                publisherID= publisher[0].id
            }
            else{
                let q1 = `insert  into publisher (name , address , telephone) values ('${req.body.publisher}','${req.body.p_name}' ,'${req.body.p_telephone}'  );`
                publisher = await DB(q1);
                publisherID = publisher.insertId;
            }

            
            let q2 = ` insert into book (isbn, title, publication_year, price, publisher_id, threshold, category, number_of_copies)
             values (${req.body.isbn} , '${req.body.title}' , '${req.body.publication_year}'  , ${req.body.price} , ${publisherID} , ${req.body.thres}, '${req.body.category}' 
               , ${req.body.noOFCopies}
             )
            ;
            `
            await DB(q2);

            let isbn = req.body.isbn
            let authorID=[];
            console.log(req.body.authors)
            async.each(req.body.authors, function (item, callback) {

                let q3 = `insert  into Author (name) values('${item}')`
                DB(q3).then((r) => {
                    authorID.push(r.insertId);

                    callback(null)
                }).catch(e => {
                    console.log(e.sqlMessage)
                    if (e.code.includes('ER_DUP_ENTRY')){
                        let qq = `select id from Author where name = '${item}' `
                        DB(qq).then((r)=>{
                            console.log("get id: ",r);
                            authorID.push(r[0].id); 
                            callback(null)
                        }) 

                    }else{
                        console.log(e)
                        callback(e);
                    }
                
                })

            }, function (err) {
                //If any of the user creation failed may throw error.
                if (err) 
                    return res.status(500).json({ err: err });

          
                async.each(authorID, function (item, callback) {

                    let q4 = `insert ignore into Book_Author (book_isbn , author_id) values (${isbn},${item}) `
                    DB(q4).then((r) => {
                      

                        callback(null)
                    }).catch(e => {
                        callback(e);
                    })

                }, function (err) {
                    //If any of the user creation failed may throw error.
                    if (err)
                        return res.status(500).json({ err: err });
                        
                        
                    return res.json();
                  
                });

                
            });



        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },



    update: async (req, res) => {
        let b ={
            email: req.body.email,
            isbn: req.body.isbn,
            title: req.body.title,
            publication_year: req.body.publication_year,
            price: req.body.price,
            publisher: req.body.publisher,
            thres: req.body.thres,
            category: req.body.category,
            noOFCopies: req.body.noOFCopies,
            p_id:req.body.p_id
        }

        try {
            //isbn, title, publication_year, price, publisher_id, threshold, category, number_of_copies
            let q2 = `UPDATE book 
               SET 
               number_of_copies = ${b.noOFCopies} ,
                title = '${b.title}' ,
                publication_year = ${b.publication_year} ,
                price = ${b.price} ,
                threshold = ${b.thres} ,
                 category = '${b.category}' 

               
               WHERE isbn = ${b.isbn};`

    
        
            await DB(q2);

            let q3  = `update publisher  set name = '${b.publisher}'   where id =${b.p_id}`
               
            await DB(q3);

            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }

    },

}