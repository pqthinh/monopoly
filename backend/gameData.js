const boardData = [
    { id: 0, name: "LẬP QUỐC", type: 'start', buildings: 0 },
    { id: 1, name: "Đền Đông Cổ", type: 'property', price: 60000, buildCost: 50000, rent: [2000, 10000, 30000, 90000, 160000], colorGroup: 'era1', buildings: 0 },
    { id: 2, name: "Làng Đông Sơn", type: 'property', price: 60000, buildCost: 50000, rent: [4000, 20000, 60000, 180000, 320000], colorGroup: 'era1', buildings: 0 },
    { id: 3, name: "Thành Tây Vu", type: 'property', price: 80000, buildCost: 50000, rent: [5000, 25000, 75000, 220000, 390000], colorGroup: 'era1', buildings: 0 },
    { id: 4, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 5, name: "Núi Nghĩa Lĩnh", type: 'property', price: 100000, buildCost: 50000, rent: [6000, 30000, 90000, 270000, 400000], colorGroup: 'era2', buildings: 0 },
    { id: 6, name: "Làng Cương Hy", type: 'property', price: 100000, buildCost: 50000, rent: [6000, 30000, 90000, 270000, 400000], colorGroup: 'era2', buildings: 0 },
    { id: 7, name: "Sông Hồng", type: 'river', price: 200000, buildings: 0 },
    { id: 8, name: "Thành Cổ Loa", type: 'property', price: 120000, buildCost: 50000, rent: [8000, 40000, 100000, 300000, 450000], colorGroup: 'era2', buildings: 0 },
    
    { id: 9, name: "Ô Nhà Tù", type: 'jail', buildings: 0 },
    { id: 10, name: "Chùa Bút Tháp", type: 'property', price: 140000, buildCost: 100000, rent: [10000, 50000, 150000, 450000, 625000], colorGroup: 'era3', buildings: 0 },
    { id: 11, name: "Thành Đại La", type: 'property', price: 140000, buildCost: 100000, rent: [10000, 50000, 150000, 450000, 625000], colorGroup: 'era3', buildings: 0 },
    { id: 12, name: "Tống Bình", type: 'property', price: 160000, buildCost: 100000, rent: [12000, 60000, 180000, 500000, 700000], colorGroup: 'era3', buildings: 0 },
    { id: 13, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 14, name: "Chùa Dâu", type: 'property', price: 180000, buildCost: 100000, rent: [14000, 70000, 200000, 550000, 750000], colorGroup: 'era4', buildings: 0 },
    { id: 15, name: "Sông Bạch Đằng", type: 'river', price: 200000, buildings: 0 },
    { id: 16, name: "Luy Lâu", type: 'property', price: 180000, buildCost: 100000, rent: [14000, 70000, 200000, 550000, 750000], colorGroup: 'era4', buildings: 0 },
    { id: 17, name: "Thuận Thành", type: 'property', price: 200000, buildCost: 100000, rent: [16000, 80000, 220000, 600000, 800000], colorGroup: 'era4', buildings: 0 },
    
    { id: 18, name: "Ô Lễ Hội", type: 'festival', buildings: 0 },
    { id: 19, name: "Bao Vinh", type: 'property', price: 220000, buildCost: 150000, rent: [18000, 90000, 250000, 700000, 875000], colorGroup: 'era5', buildings: 0 },
    { id: 20, name: "Sông Như Nguyệt", type: 'river', price: 200000, buildings: 0 },
    { id: 21, name: "Kinh thành Huế", type: 'property', price: 220000, buildCost: 150000, rent: [18000, 90000, 250000, 700000, 875000], colorGroup: 'era5', buildings: 0 },
    { id: 22, name: "Chùa Thiên Mụ", type: 'property', price: 240000, buildCost: 150000, rent: [20000, 100000, 300000, 750000, 925000], colorGroup: 'era5', buildings: 0 },
    { id: 23, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 24, name: "Kê Chợ", type: 'property', price: 260000, buildCost: 150000, rent: [22000, 110000, 330000, 800000, 975000], colorGroup: 'era6', buildings: 0 },
    { id: 25, name: "Thành Thăng Long", type: 'property', price: 260000, buildCost: 150000, rent: [22000, 110000, 330000, 800000, 975000], colorGroup: 'era6', buildings: 0 },
    { id: 26, name: "Chùa Một Cột", type: 'property', price: 280000, buildCost: 150000, rent: [24000, 120000, 360000, 850000, 1025000], colorGroup: 'era6', buildings: 0 },
    
    { id: 27, name: "Ô Ngựa Ô", type: 'teleport', buildings: 0 },
    { id: 28, name: "Chùa Thạch Long", type: 'property', price: 300000, buildCost: 200000, rent: [26000, 130000, 390000, 900000, 1100000], colorGroup: 'era7', buildings: 0 },
    { id: 29, name: "Điện Biên Phủ", type: 'property', price: 300000, buildCost: 200000, rent: [26000, 130000, 390000, 900000, 1100000], colorGroup: 'era7', buildings: 0 },
    { id: 30, name: "Sông Bến Hải", type: 'river', price: 200000, buildings: 0 },
    { id: 31, name: "Bản Mười Phăng", type: 'property', price: 320000, buildCost: 200000, rent: [28000, 150000, 450000, 1000000, 1200000], colorGroup: 'era7', buildings: 0 },
    { id: 32, name: "Ô Thuế", type: 'tax', taxAmount: 200000, buildings: 0 },
    { id: 33, name: "Phước Vĩnh An", type: 'property', price: 350000, buildCost: 200000, rent: [35000, 175000, 500000, 1100000, 1300000], colorGroup: 'era8', buildings: 0 },
    { id: 34, name: "Địa đạo Củ Chi", type: 'property', price: 350000, buildCost: 200000, rent: [35000, 175000, 500000, 1100000, 1300000], colorGroup: 'era8', buildings: 0 },
    { id: 35, name: "Chùa Hội Phước", type: 'property', price: 400000, buildCost: 200000, rent: [50000, 200000, 600000, 1400000, 1700000], colorGroup: 'era8', buildings: 0 },
];

const characterCards = [
    { id: 'lac_long_quan', name: "Lạc Long Quân", description: "Bắt đầu với 2,500,000 tiền thay vì 2,000,000." },
    { id: 'au_co', name: "Âu Cơ", description: "Khi đi qua ô Bắt Đầu, nhận thêm 500,000 tiền." },
    { id: 'ly_thuong_kiet', name: "Lý Thường Kiệt", description: "Giảm 10% chi phí xây dựng công trình." },
    { id: 'tran_hung_dao', name: "Trần Hưng Đạo", description: "Trả tiền thuê đất cho người chơi khác được giảm 10%." },
    { id: 'quang_trung', name: "Quang Trung", description: "Lần đầu vào tù được miễn phí." },
    { id: 'le_loi', name: "Lê Lợi", description: "Nhận miễn phí 1 vùng đất Thời kỳ 1 đầu tiên bạn đặt chân đến." },
];

const opportunityCards = [
    { text: "Quốc khố thặng dư. Nhận 200,000 vàng.", action: 'add_money', value: 200000 },
    { text: "Được mùa, nông sản bội thu. Nhận 100,000 vàng.", action: 'add_money', value: 100000 },
    { text: "Trúng thầu công trình quốc gia. Nhận 500,000 vàng.", action: 'add_money', value: 500000 },
    { text: "Sửa chữa thành trì, chi 100000 cho mỗi công trình.", action: 'pay_per_building', value: 100000 },
    { text: "Thoát khỏi ngục tù. Giữ lá bài này.", action: 'get_out_of_jail_free' },
    { text: "Tiến đến ô LẬP QUỐC.", action: 'move_to', value: 0 },
    { text: "Tiến đến Thành Thăng Long.", action: 'move_to', value: 25 },
    { text: "Nộp phạt vì đi sai luật. Mất 50000 tiền.", action: 'remove_money', value: 50000 },
];

const destinyCards = [
    { text: "Thiên tai, mất mùa. Mất 150,000 vàng.", action: 'remove_money', value: 150000 },
    { text: "Bị giặc ngoại xâm quấy phá. Mất 100,000 vàng.", action: 'remove_money', value: 100000 },
    { text: "Đi thẳng vào tù, không đi qua ô Lập Quốc.", action: 'go_to_jail' },
    { text: "Khao quân, mỗi người chơi khác nhận 50,000 vàng từ bạn.", action: 'pay_players', value: 50000 },
    { text: "Nhận tiền mừng từ các lãnh chúa. Mỗi người chơi khác trả bạn 50,000.", action: 'collect_from_players', value: 50000 },
    { text: "Lùi lại 3 bước.", action: 'move_steps', value: -3 },
];


module.exports = {
    boardData,
    opportunityCards,
    destinyCards,
    characterCards
}