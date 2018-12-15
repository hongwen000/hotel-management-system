-- 建立空房间视图
create view


create view empty_room_table(room_id , floor, room_num, price) as
(
    select Room.id, Room.floor, Room.room_num, Room.price
    from Room
    where Room.id not exist (
        select Order.id
        from Order
        where Order.status == 'TODO:' -- TODO: 寻找已预订以及已入住的房间
    )
);



-- 查询可用房间
-- check_in 入住时间
-- check_out 退房时间
select 