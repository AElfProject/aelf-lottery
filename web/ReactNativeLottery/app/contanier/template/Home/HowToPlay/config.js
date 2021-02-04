const howToPlay = {
  'zh-cn': {
    details: `
Lucky Box选择区分为万位、千位、百位、十位和个位，各位号码范围为0～9。每期从各位上开出1个号码作为中奖号码，即开奖号码为5位数。Lucky Box玩法即是选择5位开奖号码的全部号码、部分号码或部分号码特征。玩法包括普通、优选、精选、臻选、至尊五种玩法。
 
1、选择方式
1）普通
对十位和个位的大小单双4种特征中各选一种特征为一次机会，最多可4种特征全选，所选特征与开奖号码后两位号码特征一致即中奖，单次机会奖金4幸运币。示例：开奖号码后两位为78，则大大、大双、单双、单大为中奖。
 
2）优选
对个位选1个号码为一次机会，最多可0～9全选，选择号码与开奖号码后一位一致即为中奖，单次机会奖金10幸运币。
 
3）精选直选
对十位和个位各选1个号码为一次机会，每位号码最多可0～9全选，选择号码与开奖号码后两位按位一致即为中奖，单次机会奖金100幸运币。
 
4）臻选直选
对百位、十位和个位各选1个号码为一次机会，每位号码最多可0～9全选，选择号码与开奖号码后三位按位一致即为中奖，单次机会奖金1000幸运币。
 
5）至尊直选
对万位、千位、百位、十位和个位各选1个号码为一次机会，每位号码可从0～9全选，选择号码与开奖号码按位一致，即为中奖，单次机会奖金100000幸运币。

6）倍数选择或输入
对普通、优选、精选、臻选、至尊这5种玩法选择的机会进行加倍，只能按照整数进行加倍。

2、设奖与中奖
普通——中十位和个位大小单双——4幸运币
优选——中个位号码——10幸运币
精选——定位中后两码——100幸运币
臻选——定位中后三码——1000幸运币
至尊——定位中5码——100000幸运币
 
 
注意：
<1>假设当期的开奖号码为45678（组选三适用开奖号码为45668）。
<2>前三码和后三码：前三码指开奖号码的前三位号码，后三码指开奖号码的后三位号码。示例：开奖号码为45678，前三码为456，后三码为678。
<3>前两码和后两码：前两码指开奖号码的前两位号码，后两码指开号码的后两位号码。示例：开奖号码为45678，前两码为45，后两码为78。
<4>定位和不定位：定位指选择号码与开奖号码按位一致，不定位指选择号码与开奖号码一致，顺序不限。示例：开奖号码为45678，78则定位中后两码，78或87则为不定位中后两码。`,
  },
  en: {
    details: `
The bets of Lucky Box is divided into 5 digit, 4 digit, 3 digit, 2 digit and 1 digit. Each digit range is 0-9. We will draw a number from each digit as the winning number, that is, the winning number is 5 digits. The Lucky Box is to guess all the numbers or part number of the 5-digit winning numbers. There are two ways to play Lucky Box, including ‘big, small, odd, even’(Average), ‘Pick number’ includes pick 1(Fair) , pick 2(Good), pick 3 (Very Good) and pick 5 (Excellent).

A. How to Play

1. Big, Small, Odd, Even (Average)
We need to guess the features of tens and ones digits. We can choose features from the ‘big-small-odd-even’ to place a single bet, with a maximum of four features. If the feature you choose matches the last two digits of the winning number, you win. The prize for a single bet is 4 lucky coins. EXAMPLE: The last two digits of winning number are 78, then big-big, big-even, odd-even, odd-big will win.

2. Pick 1 (Fair)
You need to select one digit from 0 to 9. If your number is the same as the last one digit of winning number, you will win. The prize for a single bet is 10 lucky coins. 

3. Pick 2-Straight  (Exact Order)  (Good)
Place a bet, select 2 number from 0 to 9 for the ten digits and one digit. If the bet number is consistent with the last two digits of the winning number, it is the winner. The prize for a single bet is 100 lucky coins

4. Pick 3 - Straight (Exact Order) (Very Good)
Select 3 digits from 0 to 9. If the 3 digits you choose match the last three digits of winning number in exact order, you can win. The prize for a single bet is 1000 lucky coins.

5. Pick 5 - Straight (Exact Order) (Excellent)
Select 5 digits from 0 to 9. If the 5 digits you choose match the winning number in exact order, you can win. The prize for a single bet is 100,000 lucky coins.

6.Choose or input x times
Increased x times for 5 play options. X can only be an integer (x = 1,2,3...n). 5 play options includes ‘big, small, odd, even’(Average), ‘Pick number’ includes pick 1(Fair) , pick 2(Good), pick 3 (Very Good) and pick 5 (Excellent).


B. Prize rules
‘Pick number’ includes pick 1, pick 2 pick 3  and pick 5 

Average-Big, small, odd, even - one or two digits - 4 lucky coins
Fair - pick 1 - one digit - 10 lucky coins
Good- pick 2 (Straight) - last two digits (exact order) - 100 lucky coins
Very Good - pick 3 (Straight) - last three digits (exact order) - 1000 lucky coins
Excellent - Pick 5 (Straight) -  five digits (exact order) - 100000 lucky coins

Notes:
<1> Suppose that the winning number is 45678 (For Box-3 way: the assuming winning number is 45668).

<2> The front 3 digits and the back 3 digits: The front 3 digits refer to the first 3 digits of the winning number, and the back 3 digits refer to the last 3 digits of the winning number. Example: the winning number is 45678, The front 3 digits are 456, and the back 3 digits are 678.

<3> The front 2 digits and the back 2 digits: The front 2 digits refer to the first 2 digits of the winning number, and the back 2 digits refer to the last 2 digits of the winning number. Example: the winning number is 45678, The front 2 digits are 45, and the back 3 digits are 78.

<4> Exact order and Any order: Winning combination can be divided into in order and out of order. Exact order = in order, Any order = out of order. Example: winning number is ‘45678’, the last two digits of winning number in order should be ‘78’.`,
  },
};

export default howToPlay;
