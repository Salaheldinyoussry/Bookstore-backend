
const DB = require("../DB/pool");
module.exports = {
    login: async (req, res) => {
       try{
           let query =`select * from user where email='${req.body.email}' and password ='${req.body.password}'; `
         //  console.log(query,req);
           let users = await DB(query);

           if(users.length ){
               return res.json({ email: users[0].email, role: users[0].type });
           }
           return res.status(403).json({err: "invalid credintials" })
       }catch(e){
           return res.status(500).json({err: e});
       }

    },

    signup: async (req,res )=>{
        let u = req.body ;

        try {
            let query = `insert into user values ('${u.user_name}' , '${u.password}' , 0 , 1 , '${u.fname}' , '${u.lname}' , '${u.shipingAddress}' , '${u.email}' , '${u.phone}' ); `
           await  DB(query);
            return res.json({});

        } catch (e) {
            return res.status(500).json({ err: e });
        }


    },

    get: async (req, res) => {

        try {
            let query = `select * from user where email='${req.query.email}';`
                      let user =  await DB(query);
            return res.json(user);

        } catch (e) {
            return res.status(500).json({ err: e });
        }


    },

    
    update: async (req, res) => {
         let u =req.body;
        try {
            let query = `update user 
            set
            user_name = '${u.user_name}',
            password = '${u.password}',
            fname = '${u.fname}' ,
            lname = '${u.lname}' ,
            phone = '${u.phone}' ,
            shipingAddress = '${u.shipingAddress}'
            
            where email='${req.query.email}';`

            let user = await DB(query);
            return res.json(user);

        } catch (e) {
            return res.status(500).json({ err: e });
        }


    },

    logout: async (req, res) => {

        try {
            let query =  `delete   from cart  
                                where userEmail = '${req.query.email}'`

             await DB(query);
            return res.json();

        } catch (e) {

            return res.status(500).json({ err: e });
        }


    },


    getAll: async (req, res) => {

        try {
            let query = `select * from user ;`
            let users = await DB(query);
            return res.json(users);

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }


    },
    

       promote: async (req, res) => {

        try {
            let query = `update user 
            set
            type =1
            where email='${req.query.email}';`

            console.log(query);

            await DB(query);
            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }


    },

    

    confirmOrder: async (req, res) => {

        try {
            let query = `delete from  Book_order 
            where book_isbn=${req.body.book_isbn} and  quantity =${req.body.quantity}  and user_email = '${req.query.email}';`

            await DB(query);

            let q = `UPDATE book SET number_of_copies = number_of_copies + ${req.body.quantity} WHERE isbn = ${req.body.book_isbn}`
            await DB(q);

            console.log(q);
            return res.json();

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }


    },

    getanalytics: async (req, res) => {

        try {
            let q1 = `SELECT count(*) as totalSales FROM onlinestore.purchase where
                createdAt > DATE_SUB( DATE( NOW( ) ) , INTERVAL 1
                MONTH ) 
                ;`          

            let total = await DB(q1);
            total = total[0].totalSales;


            let q2 =`SELECT  user_name , fname ,lname , phone, user_email , count(*) as totalSales FROM onlinestore.purchase 
                    join user on user_email = email
                    where
                    createdAt > DATE_SUB( DATE( NOW( ) ) , INTERVAL 3
                    MONTH ) 
                    group by user_email 
                    ORDER BY totalSales DESC  limit 5; `

            let topUsers = await DB(q2);
            
            let q3 = `SELECT  isbn , title , category , count(*) as totalSales FROM onlinestore.purchase 
                        join book on book_isbn = isbn
                        where
                        createdAt > DATE_SUB( DATE( NOW( ) ) , INTERVAL 3
                        MONTH ) 
                        group by book_isbn 
                        ORDER BY totalSales DESC  limit 10; 
                        ;`

            let topBooks = await DB(q3);

            let analytics ={
                total: total,
                topBooks : topBooks,
                topUsers :topUsers
            }



            return res.json(analytics);

        } catch (e) {
            console.log(e)
            return res.status(500).json({ err: e });
        }


    },





//     UPDATE table_name
// SET column1 = value1, column2 = value2, ...
//     WHERE condition;

}