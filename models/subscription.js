const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

  Allsubscription: async (status) => {
    return db.query("select * from subscription_plan where status = ?", [status]);
  },

  AllsubscriptionUser: async (user_id, subscription_id) => {
    return db.query("select * from 	user_subscription where user_id = ? and subscription_id = ?  and overlap_status=0", [user_id, subscription_id]);
  },


  Addsubscription: async (user_subscription) => {
    return db.query("insert into user_subscription set ?", [user_subscription]);
  },

  ChecksubscriptionUser: async (user_id) => {
    return db.query("select A.expired_at,A.subscription_id,A.start_date, A.sub_status as sub_status, A.id as user_sub_id ,A.created_at as created_at,B.* from user_subscription A JOIN  subscription_plan B ON B.id = A.subscription_id  where A.user_id = ? AND A.overlap_status = 0 ORDER BY A.id ASC ", [user_id]);
  },
  
  Checksubscription_by_id: async (user_id) => {
    return db.query("select A.expired_at,A.subscription_id,A.start_date,A.overlap_status,A.overlap_date,A.created_at as created_at,B.* from user_subscription A JOIN  subscription_plan B ON B.id = A.subscription_id  where A.user_id = ? AND overlap_status = 1  ", [user_id]);
  },

  Allsubsdata: async (user_id) => {
    return db.query("select * from 	user_subscription where user_id = ? ORDER BY id DESC LIMIT 1", [user_id]);
  },

  userCurrentSubscription: async (user_id) => {
    return db.query("select * from  user_subscription where user_id = ? AND sub_status = 1 ", [user_id]);
  },

  ChecksubscriptionDates: async (user_id) => {
    return db.query("select A.expired_at,A.subscription_id,B.* from user_subscription A JOIN  subscription_plan B ON B.id = A.subscription_id  where A.user_id = ? AND CURRENT_DATE() BETWEEN A.start_date AND A.expired_at  AND sub_status = 1", [user_id]);
  },

  fetch_subscription_plan: async (user_id, planId) => {
    return db.query("select * from user_subscription A JOIN  subscription_plan B ON B.id = A.subscription_id  where A.user_id = ? AND A.subscription_id=?", [user_id, planId]);
  },

  get_subscription_plan_by_id: async (id) => {
    return db.query("select * from subscription_plan where id = ?", [id]);
  },

}