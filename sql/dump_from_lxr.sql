 
create or replace procedure PROC_register_user
  (in Arg_username varchar(32), in Arg_password varchar(32),
  in Arg_realname varchar(128), in Arg_credential varchar(32))
  begin
    declare L_id integer ;
    start transaction ;
    select max(U.id) from User U into L_id;
    insert into User(id, credential, name, gender, birthdate, phone, bonus, balance)
      values(L_id + 1, Arg_credential, Arg_realname, null, null, null, 0, 0);
    insert into Account(id, username, role, password)
      values(L_id + 1, Arg_username, Arg_password, 3);
    commit;
  end;


create or replace procedure PROC_order_room
  (in Arg_room_id int, in Arg_user_id int, in Arg_check_in Date, in Arg_check_out Date)
  begin
    declare L_price integer ;
    declare L_days integer ;
    declare L_already_occupied integer ;
    select (DATEDIFF(Arg_check_out, Arg_check_in)+1) into L_days;
    start transaction ;
    select count(o.id) from VIEW_available_orders o
      where Arg_room_id = o.room_id and Arg_check_in <= o.check_out and Arg_check_out >= o.check_in
      into L_already_occupied;
    IF (L_already_occupied) THEN
     SIGNAL SQLSTATE '45000' SET
     MYSQL_ERRNO = 30004,
     MESSAGE_TEXT = 'Sorry, the room is already occupied';
    elseif (L_days < 0) THEN
     SIGNAL SQLSTATE '45000' SET
     MYSQL_ERRNO = 30001,
     MESSAGE_TEXT = 'Wrong order(Arg_check_in > Arg_check_out)';
    else
     select r.price from Room r
      where r.id = Arg_room_id
      into L_price;
     insert into `Order` (room_id, user_id, check_in, check_out, status,fee) value
     (Arg_room_id, Arg_user_id, Arg_check_in, Arg_check_out, 1, L_price * L_days);
     insert into Operation(time, detail, order_id) value( now(), 1, LAST_INSERT_ID());
    end if;
    commit;
  end;

create or replace procedure PROC_cancel_order
  (in Arg_order_id int)
  begin
    declare O_status int;
    declare O_check_in Date;
    declare O_check_out Date;
    declare O_refund_days int;
    select -1 into O_status;
    select O.status from VIEW_available_orders O
      where O.id = Arg_order_id
      into O_status;
    select O.check_in
     from VIEW_available_orders O
     where O.id = Arg_order_id
     into O_check_in;
    select O.check_out
     from VIEW_available_orders O
     where O.id = Arg_order_id
     into O_check_out;
    IF (CURDATE() >= O_check_out or O_status = 0 or O_status = -1) THEN
     SIGNAL SQLSTATE '45000' SET
     MYSQL_ERRNO = 30005,
     MESSAGE_TEXT = 'Sorry, cancelling this order is not available';
    elseif (CURDATE() < O_check_in) Then
     update User, `Order`
     set User.balance = User.balance + `Order`.fee
     where `Order`.id = Arg_order_id and `Order`.user_id = User.id;
     update `Order`
      set `Order`.status = 0
      where `Order`.id = Arg_order_id;
     insert into Operation(time, detail, order_id)
      value (now(), 2, Arg_order_id );
    else
     select DATEDIFF(O_check_out, CURDATE())
      into O_refund_days;
     update User, `Order`
      set User.balance =
        User.balance + O_refund_days *
        `Order`.fee /(O_check_out - O_check_in + 1)
        where User.id = `Order`.user_id and `Order`.id = Arg_order_id;
     update `Order`
      set `Order`.status = 0
      where `Order`.id = Arg_order_id;
     insert into Operation(time, detail, order_id) value (now(), 2, Arg_order_id);
    end if;
  end;
