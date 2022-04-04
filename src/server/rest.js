import express from "express";
import { connection } from "./connection.js";

const port = 3001;

export const serveRest = (data) => {
  const app = express();

  app.get("/devices", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const direction = req.query.direction || 'asc'
    let orderBy = req.query.orderBy || 'name'
    if(orderBy==='version') orderBy = `v.major ${direction},v.minor ${direction},v.patch`

    console.log("devices get limit", limit, "offset", offset, "orderBy", orderBy, "dir", direction)

    const dataQuery = await connection.raw(`
      select d.name, d.user_email, u.admin
      --, ROW_NUMBER() OVER(ORDER BY d.id) AS row_number
        , v.major, v.minor, v.patch
        , ( cast(v.major as text) || '.' || cast(v.minor as text) || '.' || cast(v.patch as text) ) as version
        , case when julianday('now') - julianday(upd.finished) < 1.0 then 'Today' else upd.finished end as updated
        , ( select cast(latest_v.major as text) || '.' || cast(latest_v.minor as text) || '.' || cast(latest_v.patch as text)
            from firmware_versions latest_v order by id desc limit 1 
          ) as latest_version
        , ( select count(*) 
            from devices d 
            join users u on u.email = d.user_email and u.subscription_ends and julianday(u.subscription_ends) > julianday('now') 
          ) as total
      from devices d
      join users u on u.email = d.user_email and julianday(u.subscription_ends) > julianday('now')
      join firmware_versions v on v.id = d.firmware_version_id
      left join updates upd on upd.id = ( select id from updates where device_id = d.id order by id desc limit 1)
      order by ${orderBy} ${direction}
      limit ${limit} offset ${offset}
    `)
    
    res.json(dataQuery);
  });

  app.listen(port, () =>
    console.log(`REST Server ready at http://localhost:${port}`)
  );
};
