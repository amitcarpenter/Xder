const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

  registerUser: async (user) => {
    return db.query("insert into users set ?", [user]);
  },

  insert_report: async (report_info) => {
    return db.query("insert into reports set ?", [report_info]);
  },

  profile_vist: async (user_id, visit_user_id) => {
    return db.query(`insert into profile_visit set user_id = '${user_id}' , visit_user_id = '${visit_user_id}'`);
  },

  get_profile_vist: async (user_id) => {
    return db.query(`select * from  profile_visit where visit_user_id = '${user_id}' order by id desc`);
  },

  Get_new_users: async (user_id) => {
    return db.query(`SELECT * FROM users WHERE  id != '${user_id}' AND complete_profile_status = 1 AND verify_user = 1 AND created_at >= CURDATE() - INTERVAL 1 WEEK ORDER BY created_at DESC  `);
  },

  Get_nearby_users: async (user_id) => {
    return db.query(`SELECT * FROM users WHERE  id != '${user_id}' AND complete_profile_status = 1 AND verify_user = 1 AND incognito_mode = 0 `);
  },

  update_viewed_profile: async (user_id) => {
    return db.query(`Update profile_visit set viewd_profile= 1 where visit_user_id = '${user_id}'`);
  },

  checkViewedProfile: async (user_id) => {
    return db.query(`select COUNT(viewd_profile) as count_profile from  profile_visit where visit_user_id = '${user_id}' and viewd_profile= 0 `);
  },


  getAllprofileVist: async (user_id, visit_user_id) => {
    return db.query(`select * from  profile_visit where user_id = '${user_id}' AND visit_user_id = '${visit_user_id}'`);
  },

  fetchUserByEmail: async (email) => {
    return db.query("select * from users where email = ?", [email]);
  },

  fetchUserByStatus: async (email) => {
    return db.query("select * from users where email = ?", [email]);
  },

  fetchUserByPhone_number: async (phone_number) => {
    return db.query("select * from users where phone_number = ?", [
      phone_number,
    ]);
  },

  notificationVisit: async (where) => {
    return db.query(`select * from notifications  '${where}' , order by id DESC`);
  },

  fetchUserByPhone_number_and_otp: async (phone_number, otp) => {
    return db.query(
      `select * from users where phone_number = '${phone_number}' AND OTP_forgot = '${otp}'`,
      [phone_number, otp]
    );
  },

  fetchUserByemail_and_otp: async (email, otp) => {
    return db.query(
      `select * from users where email = '${email}' AND OTP_forgot = '${otp}'`,
      [email, otp]
    );
  },

  updateToken: async (token, email, act_token) => {
    return db.query("Update users set token= ? where email=?", [
      token,
      email,
      act_token,
    ]);
  },

  update_otp_by_email: async (otp, email) => {
    return db.query(`Update users set OTP_forgot= ? where email=?`, [
      otp, email
    ]);
  },

  update_otp_by_phone_number: async (phone_number, otp) => {
    return db.query(
      `Update users set OTP_forgot= '${otp}' where phone_number='${phone_number}'`,
      [phone_number, otp]
    );
  },

  fetchUserByActToken: async (act_token) => {
    return db.query("select * from users where act_token = ?", [act_token]);
  },

  updateUser: async (token, email) => {
    return db.query("Update users set token=? where email=?", [token, email]);
  },

  updateUserByActToken: async (token, act_token, id) => {
    return db.query(
      `Update users set verify_user = 1, token = ?, act_token = ? where id = ?`,
      [token, act_token, id]
    );
  },

  fetchUserByToken: async (token) => {
    return db.query("select * from users where token = ?", [token]);
  },

  updatePassword: async (password, hash, user_id) => {
    return db.query(
      `Update users set password= '${hash}',show_password ='${password}' where id = '${user_id}'`
    );
  },

  updatePassword_2: async (password, hash, user_id) => {
    return db.query(
      `Update users set password= '${hash}' , show_password ='${password}' where id = '${user_id}'`
    );
  },

  fetchUserById: async (id) => {
    return db.query(" select * from users where id= ?", [id]);
  },



  fetchUserByIdtoken: async (id) => {
    return db.query(`select * from users where token = '${id}' `);
  },

  fetchUserBy_Id: async (id) => {
    return db.query(`select * from users where id= '${id}'`);
  },

  fcmToken: async (email, fcm_token) => {
    return db.query(`Update users set fcm_token= '${fcm_token}' where email='${email}'`);
  },
  fcmToken_phone: async (phone_number, fcm_token) => {
    return db.query(`Update users set fcm_token= '${fcm_token}' where phone_number='${phone_number}'`);
  },
  Get_user_info: async (user_id) => {
    return db.query(`select * from users where id = '${user_id}' AND incognito_mode = 0`);
  },
  Allnotification: async (reciver_id) => {
    return db.query(`select * from notifications where reciver_id = '${reciver_id}' AND status = 0 ORDER BY id DESC `);
  },

  Allnotificationbyuser_id: async (sender_id, group_id) => {
    return db.query(`select * from notifications where sender_id = '${sender_id}' AND group_id = '${group_id}' and notification_type = 'group_request' ORDER BY id DESC `);
  },

  check_notification: async (notification_id) => {
    return db.query(`select * from notifications where id = '${notification_id}'`);
  },

  update_notification: async (notification_id, status) => {
    return db.query(`update notifications set status = '${status} where id = '${notification_id}'`);
  },

  add_favorite_user: async (favorite_user_info) => {
    return db.query("insert into favorite_users set ?", [favorite_user_info]);
  },

  addnotification: (async (send_notification) => {
    return db.query('insert into notifications set ?', [send_notification])
  }),

  updateReqnotification: async (notification_id, request_status) => {
    return db.query(`update notifications set request_status = '${request_status}', status= '1' where id = '${notification_id}'`);
  },

  fetch_fcm: async (id) => {
    return db.query(`select *  from users where id = '${id}'`);
  },

  Online_Status: async (user_id) => {
    return db.query(
      `update users set online_status = 1 where id = '${user_id}'`
    );
  },

  offline_Status: async (user_id) => {
    return db.query(
      `UPDATE users 
       SET online_status = 0, last_seen = NOW() 
       WHERE id = ?`,
      [user_id]
    );
  },

  my_all_favorite_user: async (user_id) => {
    return db.query(
      `select * from  favorite_users  where user_id = '${user_id}' ORDER BY created_at DESC`
    );
  },

  updateUserById: async (user, user_id) => {
    return db.query(
      `Update  users set name='${user.name}',username='${user.username}', profile_image='${user.profile_image}', about="${user.about}",  DOB='${user.DOB}',  country='${user.country}', city='${user.city}',  tags='${user.tags}',  height='${user.height}',  weight='${user.weight}',  ethnicity='${user.ethnicity}',  body_type='${user.body_type}',  relationship_status='${user.relationship_status}',  looking_for='${user.looking_for}',  meet_at='${user.meet_at}',  sex='${user.sex}',  pronouns='${user.pronouns}', covid_19='${user.covid_19}', age='${user.age}', twitter_link='${user.twitter_link}',instagram_link='${user.instagram_link}',facebook_link='${user.facebook_link}' where id= '${user_id}' `,
      [user, user_id]
    );
  },

  updateUserByIdcompletet: async (user, user_id) => {
    return db.query(
      `Update  users set name='${user.name}',  username='${user.username}',  complete_profile_status='1',  profile_image='${user.profile_image}', about="${user.about}",  DOB='${user.DOB}',  country='${user.country}', city='${user.city}',  tags='${user.tags}',  height='${user.height}',  weight='${user.weight}',  ethnicity='${user.ethnicity}',  body_type='${user.body_type}',  relationship_status='${user.relationship_status}',  looking_for='${user.looking_for}',  meet_at='${user.meet_at}',  sex='${user.sex}',  pronouns='${user.pronouns}', covid_19='${user.covid_19}', age='${user.age}', twitter_link='${user.twitter_link}',instagram_link='${user.instagram_link}',facebook_link='${user.facebook_link}' where id= '${user_id}' `,
      [user, user_id]
    );
  },

  updateUserbyPass: async (password, user_id) => {
    return db.query("Update users set password=? where  id =?", [
      password,
      user_id,
    ]);
  },

  fetchTokenOfUser: async (token) => {
    return db.query("select * from users where token=?", [token]);
  },

  fetchdeshboard: async () => {
    return db.query("select * from dashboard");
  },

  verify_phone_no: async (phone_number) => {
    return db.query("select * from users  where phone_number=?", [phone_number]);
  },

  updatePassword_1: async (password, token) => {
    return db.query("Update users set show_password = ? where token=?", [
      password,
      token,
    ]);
  },

  update_chat_notification_status: async (user_id, chat_notification_status) => {
    return db.query(`Update users set chat_notification = '${chat_notification_status}'  where id= '${user_id}'`);
  },

  update_group_notification_status: async (user_id, group_notification_status) => {
    return db.query(`Update users set group_notification = '${group_notification_status}'  where id= '${user_id}'`);
  },

  update_tapes_notification_status: async (user_id, taps_notification_status) => {
    return db.query(`Update users set taps_notification	 = '${taps_notification_status}'  where id= '${user_id}'`);
  },

  update_video_call_notification_status: async (user_id, video_call_notification_status) => {
    return db.query(`Update users set video_Call_notification = '${video_call_notification_status}'  where id= '${user_id}'`);
  },

  update_dont_disturb_status: async (user_id, dont_disturb) => {
    return db.query(`Update users set dont_disturb = '${dont_disturb}'  where id= '${user_id}'`);
  },


  get_all_users: async (user_id, search) => {
    let where = "";
    if (search) {
      where = ` AND username LIKE '%${search}%'`;
    }
    return db.query(
      `select * from users where id != '${user_id}' AND  AND complete_profile_status = 1 ${where}  ORDER BY id DESC `
    );
  },

  Allsubscription: async (status) => {
    return db.query("select * from subscription_plan where status = ?", [status]);
  },


  // ameen

  filter: async (age1, age2, search, user_id, body_type, relationship_status, looking_for, meet_at, height_1, height_2, weight_1, weight_2, online, app_verify, has_photo, ethnicity) => {
    let where = ` WHERE id != '${user_id}' AND complete_profile_status = 1 AND incognito_mode = 0`;

    if ((age1 != undefined && age2 != undefined) && (age1 != "" && age2 != "")) {
      where += ` AND ( age IS NULL OR  age BETWEEN '${age1}' AND '${age2}')`;
    }

    if (body_type != undefined && body_type != "") {
      where += ` AND (body_type IS NULL OR body_type IN (${body_type.split(',').map(type => `'${type.trim()}'`).join(',')}))`;
      // where += ` AND (body_type IS NULL OR body_type IN (${body_type.replace(/\s/g, '').split(',').map(type => `'${type}'`).join(',')}))`;
    }


    if (relationship_status != undefined && relationship_status != "") {
      where += ` AND (relationship_status IS NULL OR relationship_status IN (${relationship_status.split(',').map(status => `'${status.trim()}'`).join(',')}))`;
      // where += ` AND (relationship_status IS NULL OR relationship_status IN (${relationship_status.replace(/\s/g, '').split(',').map(status => `'${status}'`).join(',')}))`;
    }

    if (looking_for != undefined && looking_for != "") {
      where += ` AND (looking_for IS NULL OR looking_for IN (${looking_for.split(',').map(lookingFor => `'${lookingFor.trim()}'`).join(',')}))`;
      // where += ` AND (looking_for IS NULL OR looking_for IN (${looking_for.replace(/\s/g, '').split(',').map(lookingFor => `'${lookingFor}'`).join(',')}))`;
    }

    if (meet_at != undefined && meet_at != "") {
      where += ` AND (meet_at IS NULL OR meet_at IN (${meet_at.split(',').map(meetAt => `'${meetAt.trim()}'`).join(',')}))`;
      // where += ` AND (meet_at IS NULL OR meet_at IN (${meet_at.replace(/\s/g, '').split(',').map(meetAt => `'${meetAt}'`).join(',')}))`;
    }

    if ((height_1 != undefined && height_2 != undefined) && (height_1 != "" && height_2 != "")) {
      where += ` AND (height IS NULL OR height BETWEEN '${height_1}' AND '${height_2}')`;
    }

    if ((weight_1 != undefined && weight_2 != undefined) && (weight_1 != "" && weight_2 != "")) {
      where += ` AND (weight IS NULL OR weight BETWEEN '${weight_1}' AND '${weight_2}')`;
    }

    if (ethnicity != undefined && ethnicity != "") {
      where += ` AND ethnicity = ${ethnicity}`;
    }

    if (online != undefined && online != "") {
      where += ` AND online_status = ${online}`;
    }
    if (app_verify != undefined && app_verify != "") {
      where += ` AND app_verify = ${app_verify}`;
    }

    if (has_photo != undefined && has_photo != "") {
      where += ` AND has_photo = ${has_photo}`;
    }

    if (search != undefined && search != "") {
      where += ` AND (username LIKE '%${search}%' OR country LIKE '%${search}%' OR tags REGEXP '\\b${search}\\b')`;
      // where += ` AND (username LIKE '%${search}%' OR country LIKE '%${search}%' OR tags LIKE '%${search}%')`;


    }

    const query = `SELECT * FROM users ${where} ORDER BY id DESC`;
    return db.query(query);
  },


  // ameen

  all_Users: async () => {
    let where = ` WHERE complete_profile_status = 1`;

    const query = `SELECT * FROM users ${where}  ORDER BY id DESC`;

    return db.query(query);
  },

  delete_User: async (user_id) => {
    return db.query(`delete  from users where id='${user_id}' `);
  },

  registerUser_1: async (email, username, phone_number, now) => {
    return db.query(
      `insert into users(username,email,phone_number,timezone) VALUES('${username}','${email}','${phone_number}','${now}')`,
      [username, email, phone_number, now]
    );
  },

  phone_no_check: async (phone_number) => {
    return db.query(
      `select * from  users  where phone_number='${phone_number}'`
    );
  },
  verifyUser: async (user_id) => {
    return db.query(`update users SET verify_user = "1" where id='${user_id}'`);
  },

  verify_status: async (phone_number) => {
    return db.query(
      `Update users set phone_verify = 1 where phone_number='${phone_number}'`
    );
  },
  phone_Check: async (phone_number) => {
    return db.query(`select * from users where phone_number='${phone_number}'`);
  },
  username_Check: async (username, user_id) => {
    return db.query(
      `select * from users where username='${username}' AND id!='${user_id}'`
    );
  },

  insert_Links: async (links) => {
    return db.query("insert into social_media set ? ", [links]);
  },

  delete_actToken: async (user_id) => {
    return db.query(`update users  set act_token = "" where id='${user_id}'`);
  },

  verify_otp: async (OTP, email) => {
    return db.query(
      `select * from  users  where OTP='${OTP}' AND email = '${email}' `
    );
  },

  Delete_otp: async (OTP, email) => {
    return db.query(` update users set OTP = 0, where email = '${email}' `);
  },

  updateUserBy_ActToken: async (token, act_token, email) => {
    return db.query(
      `Update users set verify_user = 1,OTP = 0, token = ?, act_token = ? where email = ?`,
      [token, act_token, email]
    );
  },

  check_favorites_User: async (user_id, favorite_user_id) => {
    return db.query(
      `select count(*) as count from favorite_users where user_id = ${user_id} AND favorite_user_id =${favorite_user_id} `
    );
  },

  //21/11/2023
  deleteFavUser: async (user_id, favorite_user_id) => {
    return db.query(`delete  from favorite_users where user_id = ${user_id} AND favorite_user_id =${favorite_user_id} `);
  },

  Addalbums: async (albums) => {
    return db.query("insert into albums set ?", [albums]);
  },

  MyAlbums: async (user_id) => {
    return db.query(
      `select A.*,B.profile_image,B.username from  albums A JOIN users B  ON B.id = A.user_id  where A.user_id ='${user_id}' ORDER BY A.id DESC `
    );
  },

  uploadAlbums: async (albums) => {
    return db.query("insert into albums_photos set ?", [albums]);
  },

  addProfileimages: async (images) => {
    return db.query("insert into profile_images set ?", [images]);
  },

  profileimages: async (user_id) => {
    return db.query(`select image from profile_images where user_id = '${user_id}'`);
  },


  // albumsPhotos: async (user_id, album_id) => {
  //   return db.query(
  //     `select *, concat('${baseurl}` + `/albums/' , album_image) AS album_image   from  albums_photos  where user_id ='${user_id}' and album_id = '${album_id}' `
  //   );
  // },

  albumsPhotos: async (user_id, album_id) => {
    return db.query(
      `SELECT *, 
        concat('${baseurl}/albums/', album_image) AS album_image,
        concat('${baseurl}/albums/', album_thumbnail) AS album_thumbnail
      FROM albums_photos 
      WHERE user_id = '${user_id}' AND album_id = '${album_id}'`
    );
  },


  myAlbumbyId: async (user_id, album_id) => {
    return db.query(
      `select A.*,B.profile_image,B.username from  albums A JOIN users B  ON B.id = A.user_id  where A.user_id ='${user_id}' and A.id =  '${album_id}' `
    );
  },

  updateAlbum: async (album_name, album_id) => {
    return db.query(
      `Update albums set album_name =? where id = ?`,
      [album_name, album_id]
    );
  },
  insertAlbumShare: async (user) => {
    return db.query("insert into albums_sharing set ?", [user]);
  },

  MyAlbumsharing: async (user_id) => {
    return db.query(
      `select C.*,A.shared_to,B.profile_image,B.username from  albums_sharing A JOIN users B  ON B.id = A.user_id  JOIN albums C  ON C.id = A.album_id  where A.shared_to ='${user_id}' Order By A.created_at DESC `
    );
  },
  groupChat: async (group_id) => {
    return db.query(
      `select * from  chat_group  where group_id='${group_id}'`
    );
  },

  insertgroup: async (group) => {
    return db.query("insert into chat_group set ?", [group]);
  },

  inserttags: async (group) => {
    return db.query("insert into tags set ?", [group]);
  },

  appVerification: async (user_id) => {
    return db.query(`Update users set app_verify= 1 where id = '${user_id}'`);
  },

  appVerificationImage: async (data) => {
    return db.query("insert into app_verification set ?", [data]);
  },
  //

  updateShowme: async (explore, distance, view_me, user_id) => {
    return db.query(`Update setting_show_me set explore='${explore}' , distance='${distance}' , view_me='${view_me}' where user_id = '${user_id}'`);
  },

  addShowme: async (showme) => {
    return db.query("insert into setting_show_me set ?", [showme]);
  },

  deleteProfileimages: async (user_id) => {
    return db.query(`DELETE FROM profile_images WHERE id NOT IN (SELECT id FROM (SELECT id FROM profile_images where user_id = '${user_id}' ORDER BY id DESC LIMIT 5) AS last_five) AND user_id = '${user_id}'`);
  },

  fetchUserByphoneEmail: async (email, phone_number) => {
    let where = "";
    if (email) {
      where = ` where email = '${email}'`;
    } else {
      where = ` where phone_number = '${phone_number}'`;
    }
    return db.query(`select * from users ${where} `);
  },

  getUser_by_id: async (user_id) => {
    return db.query('SELECT * FROM users WHERE id =?', [user_id])
  },

  block_unblock: async (user_id, block_id, block_status) => {
    return db.query(`Update block_user set block_status= '${block_status}' where user_id = '${user_id}' and block_id='${block_id}'`);

  },

  insert_block_unblock: async (data) => {
    return db.query("insert into block_user set ?", [data]);
  },

  get_block_user: async (user_id, block_id) => {
    return db.query(`select * from block_user where user_id =${user_id} and block_id=${block_id}`)
  },

  get_block_list: async (user_id) => {
    return db.query(`select * from block_user where user_id =${user_id} and block_status= 1`)
  },

  get_block_user_status: async (user_id, block_id) => {
    return db.query(`select * from block_user where user_id =${user_id} and block_id=${block_id}`)
  },

  add_text: async (data) => {
    return db.query("INSERT INTO text_message SET ?", [data]);
  },

  fetch_text: async (user_id) => {
    return db.query(`select *  from text_message where user_id='${user_id}' `);
  },

  delete_text: async (user_id, msg_id) => {
    return db.query(`delete from text_message where user_id='${user_id}' AND id = '${msg_id}' `);
  },

  update_incognito_status: async (user_id, incognito_status) => {
    return db.query(`Update users set incognito_mode = '${incognito_status}'  where id= '${user_id}'`);
  },

  deleteNotification: async (user_id) => {
    return db.query(`delete  from notifications where id='${user_id}' `);
  },

  shared_to_count: async (table, user_id, album_id) => {
    return db.query(` SELECT COUNT(shared_to) AS share_to_count FROM ${table} WHERE user_id = ${user_id} AND album_id = ${album_id}`);
  },
  fetchVisitsInPast24Hours: async (visit_user_id) => {
    return db.query('SELECT * FROM profile_visit WHERE visit_user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) Order By created_at DESC', [visit_user_id]);
  },
  markNotificationAsSeen: async (user_id, notification_id) => {
    return db.query(`Update notifications set seen=1 where user_id=? AND id=? `, [user_id, notification_id])
  },
  selectGames: async () => {
    return db.query('select * from game1');
  },
  fetchRandomData: async (tableName, columnName) => {
    const query = `SELECT ${columnName} FROM ${tableName} ORDER BY RAND() LIMIT 1;`;
    return db.query(query);
  },
  markAllNotificationAsSeen: async (user_id) => {
    return db.query(`Update notifications set seen=1 where reciver_id=? `, [user_id])
  },
  deleteAllNotificationsProfileVisits: async (lastDay) => {
    return db.query(`Delete from notifications where notification_type='visit' AND created_at < ? `, [lastDay])
  },
  deleteAllProfileVisits: async (lastDay) => {
    return db.query(`Delete from profile_visit  where created_at < ? `, [lastDay])
  },
  newUpdateUserById: async (user, user_id) => {
    return db.query(
      `UPDATE users SET 
       name=?, 
       username=?, 
       about_me=?,  
       DOB=?,  
       country=?, 
       city=?,  
       tags=?,  
       height=?, 
       ethnicity=?,  
       relationship_type=?,  
       looking_for=?,
       sexual_orientation=?,
       gender=?,
       pronouns=?, 
       twitter_link=?, 
       instagram_link=?, 
       facebook_link=?,
       linkedIn_link=?,
       age=?,
       profile_image=?,
       sub_gender=?,
       CountryCode=?
       WHERE id=?`,
      [
        user.name,
        user.username,
        user.about_me,
        user.DOB,
        user.country,
        user.city,
        user.tags,
        user.height,
        user.ethnicity,
        user.relationship_type,
        user.looking_for,
        user.sexual_orientation,
        user.gender,
        user.pronouns,
        user.twitter_link,
        user.instagram_link,
        user.facebook_link,
        user.linkedIn_link,
        user.age,
        user.profile_image,
        user.sub_gender,
        user.CountryCode,
        user_id
      ]
    );
  },

  newCompleteUserById: async (user, user_id) => {
    return db.query(
      `UPDATE users SET 
       name=?, 
       username=?, 
       about_me=?,  
       DOB=?,  
       country=?, 
       city=?,  
       tags=?,  
       height=?, 
       ethnicity=?,  
       relationship_type=?,  
       looking_for=?,
       sexual_orientation=?,
       gender=?,
       pronouns=?, 
       twitter_link=?, 
       instagram_link=?, 
       facebook_link=?,
       linkedIn_link=?,
       age=?,
       profile_image=?,
       sub_gender=?,
       complete_profile_status=?,
       CountryCode=?
       WHERE id=?`,
      [
        user.name,
        user.username,
        user.about_me,
        user.DOB,
        user.country,
        user.city,
        user.tags,
        user.height,
        user.ethnicity,
        user.relationship_type,
        user.looking_for,
        user.sexual_orientation,
        user.gender,
        user.pronouns,
        user.twitter_link,
        user.instagram_link,
        user.facebook_link,
        user.linkedIn_link,
        user.age,
        user.profile_image,
        user.sub_gender,
        user.complete_profile_status,
        user.CountryCode,
        user_id
      ]
    );
  },

  selectUsersByFilters: async (query, params) => {
    console.log(query)
    console.log(params)
    return db.query(query, params);
  },

  deleteProfileimage: async (id, user_id) => {
    return db.query(`DELETE FROM profile_images WHERE id=? AND user_id=?`, [id, user_id]);
  },


  getAlbumsByUserId: async (user_id) => {
    return db.query(`Select * from albums where user_id = ? ORDER BY created_at DESC`, [user_id]);
  },
  hasPrivateAlbum: async (user_id) => {
    return db.query(`Select * from albums where user_id = ? AND isPrivate=1`, [user_id]);
  }
  ,
  updateAlbumRequestNotification: async (notification_id, status) => {
    return db.query(`Update notifications set album_request_status=? where id=?`, [status, notification_id]);
  },
  checkAlbumAccess: async (sender_id, reciver_id) => {
    return db.query(`Select * from notifications where sender_id=? AND reciver_id=? AND album_request_status=1`, [sender_id, reciver_id]);
  },
  newMyAlbumbyId: async (user_id, album_id) => {
    return db.query(
      `select `, [user_id, album_id]);
  },
  isAlbumShare: async (album_id, user_id, shared_to) => {
    return db.query(`select * from albums_sharing where album_id=? AND user_id=? AND shared_to=?`, [album_id, user_id, shared_to])
  },
  deleteAllSharedAlbums: async (user_id, shared_to) => {
    return db.query()
  },

  getSharedAlbumsToMe: async (user_id, shared_to) => {
    return db.query(`select * from albums_sharing where user_id=? AND shared_to=?`, [user_id, shared_to])
  },
  getAlbumById: async (id) => {
    return db.query(`select * from albums where id=? `, [id])
  },
  new_username_Check: async (username, user_id) => {
    return db.query(
      `select * from users where username=? AND id!=?`
      , [username, user_id]);
  },
  new_profileimages: async (user_id) => {
    return db.query(`select * from profile_images where user_id = '${user_id}'`);
  },
  deleteAllSharedAlbums: async (user_id, shared_to) => {
    return db.query('delete from albums_sharing where user_id=? AND shared_to=?', [user_id, shared_to])
  },
  // getLatestSharedAlbums : async (sharedTo, limit) => {
  //   return db.query(
  //     'SELECT album_id, user_id FROM albums_sharing WHERE shared_to = ? ORDER BY created_at DESC LIMIT ?', 
  //     [sharedTo, limit]
  //   );
  // },


  getLatestSharedAlbums: async (sharedTo, limit) => {
    let query = 'SELECT album_id, user_id FROM albums_sharing WHERE shared_to = ? ORDER BY created_at DESC';
    const params = [sharedTo];

    if (limit !== Infinity) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    return db.query(query, params);
  },


  getAllSharedAlbums: async (user_id, sharedTo) => {
    return db.query(
      'SELECT album_id, user_id FROM albums_sharing WHERE user_id =? AND shared_to = ? ORDER BY created_at DESC',
      [user_id, sharedTo]
    );
  },


  getAlbumDetails: async (albumIds) => {
    if (albumIds.length === 0) return [];
    return db.query('SELECT * FROM albums WHERE id IN (?)', [albumIds]);

  },


  getUniqueUserIds: async () => {
    return db.query(`
        SELECT 
            GROUP_CONCAT(DISTINCT user_id) AS user_ids
        FROM 
            profile_images
    `);
  },


  checkAlbumRequestNotification: async (sender_id, reciver_id) => {
    return db.query(`Select * from notifications where sender_id=? AND reciver_id=? AND notification_type="album_request"`, [sender_id, reciver_id])
  },


  cancelAlbumRequestNotification: async (sender_id, reciver_id) => {
    return db.query(`Delete from notifications where sender_id=? AND reciver_id=? AND notification_type="album_request"`, [sender_id, reciver_id])
  },


  all_group_notifications: async (sender_id) => {
    return db.query(`select * from notifications where sender_id = '${sender_id}'  and notification_type = 'group_request' AND request_status='3' ORDER BY id DESC `);
  },


  getUsers_by_ids: async (user_ids) => {
    const placeholders = user_ids.map(() => '?').join(',');
    return db.query(`SELECT * FROM users WHERE id IN (${placeholders})`, user_ids);
  },


  delete_album_notification: async (notification_id) => {
    if (!notification_id) {
      throw new Error("Notification ID is required");
    }
    return db.query(`DELETE FROM notifications WHERE id = ?`, [notification_id]);
  },


  delete_album_notification_by_reciver_id: async (sender_id, reciver_id) => {
    return db.query(
      `DELETE FROM notifications WHERE sender_id = ? AND reciver_id = ? AND notification_type = 'album_request'`,
      [sender_id, reciver_id]
    );
  },


  get_profile_visit_data_for_user: async (reciver_id) => {
    const query = `
      SELECT * 
      FROM notifications 
      WHERE reciver_id = ? 
        AND status = 0 
        AND notification_type = 'visit' 
      ORDER BY id DESC
    `;
    return db.query(query, [reciver_id]);
  },

  get_pro_users_list: async () => {
    const query = `
        SELECT user_id from user_subscription where sub_status = 1;
    `;
    return db.query(query);
  },

  get_user_subscription_data: async (plan_name, plan_type) => {
    const query = `
        SELECT user_id from user_subscription where %LIKE$% plan_name= $};
    `;
    return db.query(query);
  },


  get_plan_data_by_id: async (plan_id) => {
    const query = `
        SELECT * from subscription_plan where id= ${plan_id};
    `;
    return db.query(query);
  },


  get_user_data_by_id: async (user_id) => {
    const query = `
        SELECT * from users where id= ${user_id};
    `;
    return db.query(query);
  },

  updateUserLanguage: async (user_id, language) => {
    console.log(user_id, language)
    const query = `
      UPDATE users SET language = "${language}" WHERE id = ${user_id};
    `;
    return db.query(query);
  },

  get_user_language: async (user_id) => {
    const query = `
        SELECT language from users where id= ${user_id};
    `;
    return db.query(query);
  },


  // already_check_request_function: async (sender_id, reciver_id1, group_id) => {
  //   const query = `
  //       SELECT * from notifications where sender_id= ${sender_id} AND reciver_id = ${reciver_id1} AND  groupt_id = ${group_id};
  //   `;
  //   return db.query(query);
  // },

  already_check_request_function: async (sender_id, reciver_id1, group_id, notification_type) => {
    const query = `
        SELECT * FROM notifications 
        WHERE sender_id = ${sender_id} 
        AND reciver_id = ${reciver_id1} 
        AND group_id = '${group_id}'
        AND notification_type = '${notification_type}';
    `;
    return db.query(query);
  },


  update_request_reject: async (sender_id, reciver_id_for_language, group_id, notification_type, request_status) => {
    console.log(request_status, "!@#$%^#$%^$%^")
    return db.query(`update notifications set request_status = '${request_status}'  WHERE sender_id = ${sender_id} 
        AND reciver_id = ${reciver_id_for_language} 
        AND group_id = '${group_id}' AND notification_type = 'group_request';`);
  },


  delete_notification_request_reject: async (
    sender_id,
    reciver_id_for_language,
    group_id,
    notification_type = 'group_request',
  ) => {
    const query = `
      DELETE FROM notifications
      WHERE sender_id = ?
        AND reciver_id = ?
        AND group_id = ?
        AND notification_type = ?;
    `;

    const values = [sender_id, reciver_id_for_language, group_id, notification_type];

    try {
      return await db.query(query, values);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  delete_group_report: async (group_id) => {
    return db.query(`DELETE FROM reports WHERE group_id = '${group_id}';`);
  },


  get_album_data: async (albums_photo_id) => {
    const query = `
      SELECT * FROM albums_photos 
      WHERE id = ${albums_photo_id} 
  `;
    return db.query(query);
  },

  update_thubnail_album_data: async (albums_photo_id, album_thumbnail) => {
    const query = `
      UPDATE albums_photos SET album_thumbnail = '${album_thumbnail}'
      WHERE id = ${albums_photo_id} 
  `;
    return db.query(query);
  },

}