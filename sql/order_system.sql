

-- 入住日期，入住天数, 寻找在某时间段内可以被预定的房间
with order_dates(order_date) as (
    select date_add(date('2019-01-11'), interval n day) as order_date -- 入住日期参数
    from numbers
    where n <= 5 -- 入住时间参数
)
select id, room_num
from Room as R
where exists ( -- 该房间入住的日期列表减去该房间已预订的列表，不为空集
      -- 存在某几天，该房间没有被预定
      select order_date
      from order_dates
      where not exists(
           select time
           from `Order` as O
           where O.time = order_date and O.room_id = R.id and O.status = 1
          )
    ) ;
