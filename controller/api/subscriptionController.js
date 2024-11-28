const Joi = require("joi");
const jwt = require("jsonwebtoken");
const path = require("path");
const config = require("../../config");
const { Allsubscription, AllsubscriptionUser, userCurrentSubscription, Checksubscription_by_id, Addsubscription, ChecksubscriptionUser, Allsubsdata } = require("../../models/subscription");
const { getData, updateData } = require('../../models/common')
const baseurl = config.base_url;
const moment = require('moment');
const { handleError } = require("../../utils/responseHandler");


exports.Allsubscription = async (req, res) => {
  try {
    const { subscription_type } = req.body;
    const schema = Joi.object({
      subscription_type: Joi.string().required().empty().messages({
        "string.base": "Subscription type must be a string.",
        "string.empty": "Subscription type is required.",
        "any.required": "Subscription type is required.",
      }),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const currentDate = moment().format("YYYY-MM-DD");
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.data || !decoded.data.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    const userId = decoded.data.id;
    const userInfo = await getData("users", `WHERE id=${userId}`);
    if (!userInfo || userInfo.length === 0) {
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }
    const subscriptions = await Allsubscription(subscription_type);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        const userSubs = await AllsubscriptionUser(userId, subscription.id);
        if (userSubs.length > 0) {
          const startDate = userSubs[0].start_date
            ? moment(userSubs[0].start_date).format("YYYY-MM-DD")
            : null;
          const endDate = userSubs[0].expired_at
            ? moment(userSubs[0].expired_at).format("YYYY-MM-DD")
            : null;

          const isActive =
            startDate &&
            endDate &&
            currentDate >= startDate &&
            currentDate <= endDate;
          const isUpcoming = !startDate && !endDate;

          if (isActive || isUpcoming) {
            subscription.select = false;
            subscription.is_subscription = 1;
            subscription.expired = isActive ? 0 : 1;
          } else {
            subscription.select = false;
            subscription.is_subscription = 0;
            subscription.expired = 1;
          }
        } else {
          subscription.select = false;
          subscription.is_subscription = 0;
          subscription.expired = 0;
        }
      })
    );

    return res.json({
      status: 200,
      success: true,
      message: "Subscription Found Successfully!",
      subscription: subscriptions,
    });
  } catch (error) {
    console.error("Error in Allsubscription:", error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error.message,
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
            sub_status: 0
          }
        } else {
          subscription = {
            subscription_type: subscription_type,
            user_id: user_id,
            subscription_id: subscription_id,
            expired_at: expDate,
            start_date: start_date,
            sub_status: 1
          }
        }



        const checksubs = await AllsubscriptionUser(user_id, subscription_id);
        if (checksubs.length > 0) {
          return res.json({
            status: 400,
            success: false,
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

// exports.activatePlan = async (req, res) => {
//   try {
//     const { user_sub_id, plan_days, plan_type } = req.body;
//     const schema = Joi.alternatives(
//       Joi.object({
//         user_sub_id: [Joi.string().empty().required()],
//         plan_days: [Joi.string().empty().required()],
//         plan_type: [Joi.string().empty().required()],
//       })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 400,
//         success: false,
//       });
//     } else {

//       const authHeader = req.headers.authorization;
//       const token_1 = authHeader;
//       const token = token_1.replace("Bearer ", "");
//       const decoded = jwt.decode(token);
//       const user_id = decoded.data.id;
//       let subscription = "";
//       const user_info = await getData("users", `where id= ${user_id}`);

//       const currentDate = moment();
//       let start_date = currentDate.format('YYYY-MM-DD')
//       const expires = currentDate.clone().add(plan_days, plan_type);
//       let expDate = expires.format('YYYY-MM-DD')


//       console.log(start_date, "Start data")
//       console.log(expires, "expires")
//       console.log(expDate, "expDate")

//       if (user_info != 0) {
//         const subsdata = await userCurrentSubscription(user_id);
//         if (subsdata.length > 0) {

//           let data1 = ` overlap_status=1,sub_status=0,overlap_date='${start_date}'`;

//           let updateold = await updateData('user_subscription', ` where id='${subsdata[0].id}' `, data1)
//         }

//         subscription = ` user_id='${user_id}',expired_at='${expDate}',start_date='${start_date}',sub_status=1 `;

//         let updateold1 = await updateData('user_subscription', ` where id='${user_sub_id}' `, subscription)


//         if (updateold1.affectedRows > 0) {

//           return res.json({
//             status: 200,
//             success: true,
//             message: "Subscription Activated Successfully!",
//           });
//         } else {
//           return res.json({
//             status: 400,
//             success: false,
//             message: "Something went wrong!",
//           });
//         }

//       } else {
//         return res.json({
//           status: 400,
//           success: false,
//           message: "User Not Found",
//         });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "Internal server error",
//       status: 500,
//       error: error,
//     });
//   }
// };




// 0|index  | 2024-11-28 Start data
// 0|index  | Moment<2024-11-28T07:19:08+00:00> expires
// 0|index  | 2024-11-28 expDate


exports.activatePlan = async (req, res) => {
  try {
    const { user_sub_id, plan_days, plan_type } = req.body;
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
    }

    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    let subscription = "";
    const user_info = await getData("users", `where id= ${user_id}`);

    // const currentDate = moment();
    // let start_date = currentDate.format('YYYY-MM-DD')
    // const expires = currentDate.clone().add(plan_days, plan_type);
    // let expDate = expires.format('YYYY-MM-DD')


    const currentDate = moment();

    let start_date = currentDate.format('YYYY-MM-DD');
    const expires = currentDate.clone().add(plan_days, plan_type);
    let expDate = expires.format('YYYY-MM-DD');

    console.log(start_date, "Start date");
    console.log(expires.toString(), "Expires");
    console.log(expDate, "ExpDate");

    if (!user_info) {
      return res.json({
        status: 400,
        success: false,
        message: "User Not Found",
      });
    }
    const subsdata = await userCurrentSubscription(user_id);
    if (subsdata.length > 0) {

      let data1 = ` overlap_status=1,sub_status=0,overlap_date='${start_date}'`;

      let updateold = await updateData('user_subscription', ` where id='${subsdata[0].id}' `, data1)
    }

    subscription = ` user_id='${user_id}',expired_at='${expDate}',start_date='${start_date}',sub_status=1 `;

    let updateold1 = await updateData('user_subscription', ` where id='${user_sub_id}' `, subscription)


    if (updateold1.affectedRows > 0) {

      return res.json({
        status: 200,
        success: true,
        message: "Subscription Activated Successfully!",
      });
    } else {
      return res.json({
        status: 400,
        success: false,
        message: "Something went wrong!",
      });
    }



  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      status: 500,
      error: error,
    });
  }
};


exports.ChecksubscriptionUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.data || !decoded.data.id) {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }

    const userId = decoded.data.id;
    const userInfo = await getData("users", `WHERE id=${userId}`);
    if (!userInfo || userInfo.length === 0) {
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    const subscriptions = await ChecksubscriptionUser(userId);
    const currentDate = moment().format("YYYY-MM-DD");
    let activeSubscriptions = [];
    let expiredSubscriptions = [];
    let upcomingPlans = [];

    subscriptions.forEach((sub) => {
      const hasDates = sub.start_date && sub.expired_at;
      if (hasDates) {
        const isWithinValidity =
          moment(sub.start_date).format("YYYY-MM-DD") <= currentDate &&
          moment(sub.expired_at).format("YYYY-MM-DD") >= currentDate;

        if (isWithinValidity && sub.sub_status === 1) {
          sub.expired = 0;
          activeSubscriptions.push(sub);
        } else {
          sub.expired = 1;
          expiredSubscriptions.push(sub);
        }
      } else {
        sub.expired = 0;
        upcomingPlans.push(sub);
      }
    });

    if (activeSubscriptions.length > 0) {
      return res.json({
        status: 200,
        success: true,
        message: "Subscription fetched successfully!",
        current_subscription: activeSubscriptions,
        expired_subscription: expiredSubscriptions,
        upcoming_plans: upcomingPlans,
      });
    }

    const freeSubscriptions = await Allsubscription(0);
    const newFreeSubscription = freeSubscriptions.map((sub) => ({
      ...sub,
      expired: 0,
      sub_status: 1,
    }));

    return res.json({
      status: 200,
      success: true,
      message: "Free subscription activated and fetched successfully!",
      current_subscription: newFreeSubscription,
      expired_subscription: expiredSubscriptions,
      upcoming_plans: upcomingPlans,
    });
  } catch (error) {
    console.error("Error in checkSubscriptionUser:", error);
    return res.json({
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
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


//=============================== Subscription Function ===================================
exports.active_offer_subscription_for_verify = async (user_id) => {
  try {

    let subscription = {
      subscription_type: 0,
      user_id: user_id,
      subscription_id: 7,
      expired_at: "",
      start_date: "",
      sub_status: 0
    }
    const saved_subscription = await Addsubscription(subscription);
    if (saved_subscription.affectedRows > 0) {
      console.log("Subscription Added Successfully!")
    }
  } catch (error) {
    console.error(error.message)
  }
}


