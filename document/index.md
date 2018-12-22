# 产生索引的一些思路
## 索引简介
在MariaDB中，有4种类型的索引。Mariadb不严格地区分key和index，并时常根据语境对他们混用。

- 主键(primary key), unique且 not null
- unique indexes, unique 且 nullable
- plain indexes, not unique, nullable
- full-tex indexs. 同上。当使用 LIKE '%word%'时，创建这个index。
## Order的索引
### 索引建立
搜索订单几乎是最常见的一种操作。从用户的行为来判断，大部分对订单的搜索都是基于订单日期的。故在Order表上对check\_in和check\_out添加索引十分有必要。
``` sql
CREATE INDEX Order__index_check_in ON `Order` (check_in DESC);
```
在上面的索引建立中，显式地指明了索引使用降序排列。这是因为根据时间局部性，越``晚(刚刚发生）''的记录越可能被搜索，越``早（年代久远)''的记录越不可能被搜索。降序排列索引可以尽可能早地让索引被搜索到。

### 效果评价
``` sql
explain 
select * from `Order`
where check_in >= '2019-01-22';
```
看两个csv文件。没有建立索引时，仅能根据主键索引进行查询。查询了300多行，有效行数不到10%。但建立了对check\_in的索引后，以上的语句仅搜索了75行，且有效利用率为100%。

进一步测试以下的语句
``` sql
explain select * from `Order`
where check_in >= '2019-01-22'
AND check_out <= '2020-01-01';
```
发现mariaDB的做法是，先根据索引check\_in作range scan，估计会检索到75个左右的行。然后对这些行作where筛选，得到最终的结果。

### 必要性分析
在上面的语句执行中，没有用到check\_out索引，但这个索引依旧有它的必要指之处。mariaDB会选择check\_in或check\_out中的一个索引作range scan，很可能在下一次更合适的情况下会使用check\_out。维护check\_in和check\_out两个索引，可以让mariaDB有更多提升性能的可能性。

更进一步的分析，如果用户想要筛选订单，必行会出现user\_id = <int>的情况。此时user\_id一定是更适合的索引。但酒店的前台也需要筛选订单。后者往往是根据日期作筛选的。故这个索引十分有必要。


## 其他索引
### 其他表的索引需求分析
大部分对User表的查询都是使用id进行查询的。user name是用户的真名，对用户真名的查询操作其实很少。故现有的主键索引已经足够。

对Account的查询中，由于username被标记为unique，mariaDB自动为其创造索引，故对Account的大部分查询效率都很高。

一个比较微妙的操作是查询空闲房间。因为查询空闲房间涉及到查询房间(Room)、查询房间类型(RoomType)和查询订单(Order)三个表的数据。实际上这个操作的效率也是很高的。对此详细的介绍见TODO:
### 效果评价

我们的应用经常需要返回``空闲的房间数''。可是怎么定义空闲呢？如果对于一段查询时间[check\_in, check\_out],不存在与之重叠的订单（order），那么我们就说这个房间是空闲的。但实际的查询并不是通过使用check\_in和check\_out的索引进行的。
``` sql
explain 
select R.id, R.floor, R.room_num, R.price, T.breakfast, T.wifi ,T.name, T.capacity
from Room as R, RoomType as T
where R.type_id = T.id
  and T.capacity >= 2
  and T.wifi like 1
  and T.breakfast like 1
  and not exists
    ( select room_id, O.id
      from `Order` as O
      where status = 1
        and ((O.check_in <= '2018-11-20' and O.check_out >= '2018-12-30')
          or (O.check_in <= '2018-10-30' and O.check_out >= '2018-11-10'))
        and O.room_id = R.id );
```

使用explain查看查询计划后，我们发现，mariaDB
- 首先使用where筛选掉不符合要求的RoomType。由于RoomType是很小的一个表，这一步的效率非常高。
- 利用Room对RoomType的外键索引筛选合适的Room。由于利用了索引，这一步速度也非常高。
- 利用Order对Room的外键索引筛选合适的Order。由于利用了索引，这一步的速度也非常高。
  
这说明我们没有额外建立索引的必要了，现有的主键和外键索引已经能让数据库的执行速度足够高了。


## 总结
只有订单的check\_in和check\_out需要额外的索引。其他操作都可以通过主键外键索引、unique索引得到加速。