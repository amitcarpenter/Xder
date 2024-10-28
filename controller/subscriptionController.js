const Joi = require("joi");
const jwt = require("jsonwebtoken");
const path = require("path");
const config = require("../config");
const { Allsubscription, AllsubscriptionUser, userCurrentSubscription,Checksubscription_by_id, Addsubscription, ChecksubscriptionUser, Allsubsdata } = require("../models/subscription");
const { getData,updateData } = require('../models/common')
const baseurl = config.base_url;
const moment = require('moment');
//const {Allsubscription} = require('../models/users');

exports.Allsubscription = async (req, res) => {
  try {
    const { subscription_type } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        subscription_type: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const currentDate = moment();
      const authHeader = req.headers.authorization;
      // console.log("authHeader>>>>>>>", authHeader)
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");

      // console.log(">>>>>>>>>>>", token);
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);

      if (user_info != 0) {
        const subs = await Allsubscription(subscription_type);

        await Promise.all(
          subs.map(async (item, i) => {
            const subs = await AllsubscriptionUser(user_id, item.id);
            const excurdate = currentDate.format('YYYY-MM-DD');
            if (subs.length > 0) {
              if (subs[0].expired_at == excurdate) {
                item.expired = 1
              } else {
                item.expired = 0
              }
              item.is_subscription = 1
            } else {
              item.is_subscription = 0
              item.expired = 0
            }

            item.select = false
          })
        );
        return res.json({
          status: 200,
          success: true,
          message: "Subscription Found Successfully!",
          subscription: subs,
        });
      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};
exports.AddsubscriptionPlan = async (req, res) => {
  try {

    const { subscription_type, subscription_id, plan_days, plan_type } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        subscription_type: [Joi.string().empty().required()],
        subscription_id: [Joi.string().empty().required()],
        plan_days: [Joi.string().empty().required()],
        plan_type: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let subscription = "";
      const user_info = await getData("users", `where id= ${user_id}`);

      const currentDate = moment();
      let start_date = currentDate.format('YYYY-MM-DD')
      const expires = currentDate.clone().add(plan_days, plan_type);
      let expDate = expires.format('YYYY-MM-DD')

      if (user_info != 0) {
        const subsdata = await Allsubsdata(user_id);
        if (subsdata.length > 0) {
          let startfrom = moment(subsdata[0]['expired_at']).clone().add(1, 'day');
          start_date = startfrom.format('YYYY-MM-DD');
          let expireto = moment(start_date).clone().add(plan_days, plan_type);
          expDate = expireto.format('YYYY-MM-DD')

        subscription = {
          subscription_type: subscription_type,
          user_id: user_id,
          subscription_id: subscription_id,
          expired_at: "",
          start_date: "",
          sub_status:0
         }
        }else{
          subscription = {
          subscription_type: subscription_type,
          user_id: user_id,
          subscription_id: subscription_id,
          expired_at: expDate,
          start_date: start_date,
          sub_status:1
        }
        }

    

        const checksubs = await AllsubscriptionUser(user_id, subscription_id);
        if (checksubs.length > 0) {
          return res.json({
            status: 400,
            success: true,
            message: "You have already Purchase this Subscription!",
          });

        }

       
        const subs = await Addsubscription(subscription);

        if (subs.affectedRows > 0) {

          return res.json({
            status: 200,
            success: true,
            message: "Subscription Added Successfully!",
            subscription: subs,
          });
        } else {
          return res.json({
            status: 400,
            success: false,
            message: "Something went wrong!",
          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.activatePlan = async (req, res) => {
  try {

    const {  user_sub_id, plan_days, plan_type } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_sub_id: [Joi.string().empty().required()],
        plan_days: [Joi.string().empty().required()],
        plan_type: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let subscription = "";
      const user_info = await getData("users", `where id= ${user_id}`);

      const currentDate = moment();
      let start_date = currentDate.format('YYYY-MM-DD')
      const expires = currentDate.clone().add(plan_days, plan_type);
      let expDate = expires.format('YYYY-MM-DD')

      if (user_info != 0) {

        const subsdata = await userCurrentSubscription(user_id);

        if (subsdata.length > 0) {
          
        let data1 =  ` overlap_status=1,sub_status=0,overlap_date='${start_date}'`;

         let updateold =  await updateData('user_subscription', ` where id='${subsdata[0].id}' `, data1)
       }
       
        subscription = ` user_id='${user_id}',expired_at='${expDate}',start_date='${start_date}',sub_status=1 `;
            
        let updateold1 =  await updateData('user_subscription', ` where id='${user_sub_id}' `, subscription)
          
         
        if (updateold1.affectedRows > 0) {

          return res.json({
            status: 200,
            success: true,
            message: "Subscription Activated Successfully!",
          //  subscription: subs,
          });
        } else {
          return res.json({
            status: 400,
            success: false,
            message: "Something went wrong!",
          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.ChecksubscriptionUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;

    const user_info = await getData("users", `where id= ${user_id}`);
    const currentDate = moment();
   
    if (user_info != 0) {

      const checksubs = await ChecksubscriptionUser(user_id);

      let array = [];
      let array1 = [];
      if (checksubs.length > 0) {

        await Promise.all(
          checksubs.map(async (item, i) => {
            const excurdate = currentDate.format('YYYY-MM-DD');
            const  start_date = moment(item.start_date);
            const start_dated =start_date.format('YYYY-MM-DD');
            if (start_dated <= excurdate && item.expired_at >= excurdate) {
              item.expired = 0;
              array.push(item);
            } else if(item.expired_at == excurdate){
              item.expired = 1
            }else{
              item.expired = 0
            }

            if(item.sub_status != 1){
              array1.push(item)
            }

          })
        );

        return res.json({
          status: 200,
          success: true,
          message: "Subscription fetch Successfully!",
          subscription: array1,
          current_subscription : array
        });
      } else {
        let subscription = await Allsubscription(0);
        if(subscription.length > 0){
          await Promise.all(
            subscription.map(async (item, i) => {
              item.expired = 0;
              item.sub_status = 1;
            }));
        }
        return res.json({
          status: 200,
          success: true,
          message: "Free Subscription fetch Successfully!",
          subscription: [],
          current_subscription:subscription
        });
      }

    } else {
      return res.json({
        status: 400,
        success: false,
        message: "User Not Found",
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.subscription_history = async (req, res) => {
  try {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);
      const currentDate = moment();
      // const expires = currentDate.clone().add(plan_days, plan_type);  
      // 
      if (user_info != 0) {

        const checksubs = await Checksubscription_by_id(user_id);

        if (checksubs.length > 0) {

          await Promise.all(
            checksubs.map(async (item, i) => {
              const excurdate = currentDate.format('YYYY-MM-DD');
              if (item.expired_at == excurdate) {
                item.expired = 1

              } else {
                item.expired = 0
              }
            })
          );

          return res.json({
            status: 200,
            success: true,
            message: "Subscription fetch Successfully!",
            subscription: checksubs,
          });
        } else {
          return res.json({
            status: 400,
            success: false,
            message: "Something went wrong!",
            subscription: []
          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
  
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

  