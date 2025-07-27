// src/logic/data.js
// This file contains all the new static data for the game,
// including the re-configured board layout and card decks.

export const boardData = [
    { id: 0, name: "", type: 'start', buildings: 0 },
    { id: 1, name: "Đền Đông Cổ", type: 'property', price: 60000, buildCost: 50000, rent: [2000, 10000, 30000, 90000, 160000], colorGroup: 'era1', buildings: 0 },
    { id: 2, name: "Làng Đông Sơn", type: 'property', price: 60000, buildCost: 50000, rent: [4000, 20000, 60000, 180000, 320000], colorGroup: 'era1', buildings: 0 },
    { id: 3, name: "Thành Tây Vu", type: 'property', price: 80000, buildCost: 50000, rent: [5000, 25000, 75000, 220000, 390000], colorGroup: 'era1', buildings: 0 },
    { id: 4, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 5, name: "Núi Nghĩa Lĩnh", type: 'property', price: 100000, buildCost: 50000, rent: [6000, 30000, 90000, 270000, 400000], colorGroup: 'era2', buildings: 0 },
    { id: 6, name: "Làng Cương Hy", type: 'property', price: 100000, buildCost: 50000, rent: [6000, 30000, 90000, 270000, 400000], colorGroup: 'era2', buildings: 0 },
    { id: 7, name: "Sông Hồng", type: 'river', price: 200000, buildings: 0 },
    { id: 8, name: "Thành Cổ Loa", type: 'property', price: 120000, buildCost: 50000, rent: [8000, 40000, 100000, 300000, 450000], colorGroup: 'era2', buildings: 0 },

    { id: 9, name: "", type: 'jail', buildings: 0 },
    { id: 10, name: "Chùa Bút Tháp", type: 'property', price: 140000, buildCost: 100000, rent: [10000, 50000, 150000, 450000, 625000], colorGroup: 'era3', buildings: 0, header: 2 },
    { id: 11, name: "Thành Đại La", type: 'property', price: 140000, buildCost: 100000, rent: [10000, 50000, 150000, 450000, 625000], colorGroup: 'era3', buildings: 0, header: 2 },
    { id: 12, name: "Tống Bình", type: 'property', price: 160000, buildCost: 100000, rent: [12000, 60000, 180000, 500000, 700000], colorGroup: 'era3', buildings: 0, header: 2 },
    { id: 13, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 14, name: "Chùa Dâu", type: 'property', price: 180000, buildCost: 100000, rent: [14000, 70000, 200000, 550000, 750000], colorGroup: 'era4', buildings: 0, header: 2 },
    { id: 15, name: "Sông Bạch Đằng", type: 'river', price: 200000, buildings: 0 },
    { id: 16, name: "Luy Lâu", type: 'property', price: 180000, buildCost: 100000, rent: [14000, 70000, 200000, 550000, 750000], colorGroup: 'era4', buildings: 0, header: 2 },
    { id: 17, name: "Thuận Thành", type: 'property', price: 200000, buildCost: 100000, rent: [16000, 80000, 220000, 600000, 800000], colorGroup: 'era4', buildings: 0, header: 2 },

    { id: 18, name: "", type: 'festival', buildings: 0 },
    { id: 19, name: "Bao Vinh", type: 'property', price: 220000, buildCost: 150000, rent: [18000, 90000, 250000, 700000, 875000], colorGroup: 'era5', buildings: 0 },
    { id: 20, name: "Sông Như Nguyệt", type: 'river', price: 200000, buildings: 0 },
    { id: 21, name: "Kinh thành Huế", type: 'property', price: 220000, buildCost: 150000, rent: [18000, 90000, 250000, 700000, 875000], colorGroup: 'era5', buildings: 0 },
    { id: 22, name: "Chùa Thiên Mụ", type: 'property', price: 240000, buildCost: 150000, rent: [20000, 100000, 300000, 750000, 925000], colorGroup: 'era5', buildings: 0 },
    { id: 23, name: "Ô Sự Kiện", type: 'event', buildings: 0 },
    { id: 24, name: "Kê Chợ", type: 'property', price: 260000, buildCost: 150000, rent: [22000, 110000, 330000, 800000, 975000], colorGroup: 'era6', buildings: 0 },
    { id: 25, name: "Thành Thăng Long", type: 'property', price: 260000, buildCost: 150000, rent: [22000, 110000, 330000, 800000, 975000], colorGroup: 'era6', buildings: 0 },
    { id: 26, name: "Chùa Một Cột", type: 'property', price: 280000, buildCost: 150000, rent: [24000, 120000, 360000, 850000, 1025000], colorGroup: 'era6', buildings: 0 },

    { id: 27, name: "", type: 'teleport', buildings: 0 },
    { id: 28, name: "Chùa Thạch Long", type: 'property', price: 300000, buildCost: 200000, rent: [26000, 130000, 390000, 900000, 1100000], colorGroup: 'era7', buildings: 0, header: 4 },
    { id: 29, name: "Điện Biên Phủ", type: 'property', price: 300000, buildCost: 200000, rent: [26000, 130000, 390000, 900000, 1100000], colorGroup: 'era7', buildings: 0, header: 4 },
    { id: 30, name: "Sông Bến Hải", type: 'river', price: 200000, buildings: 0 },
    { id: 31, name: "Bản Mười Phăng", type: 'property', price: 320000, buildCost: 200000, rent: [28000, 150000, 450000, 1000000, 1200000], colorGroup: 'era7', buildings: 0, header: 4 },
    { id: 32, name: "Ô Thuế", type: 'tax', taxAmount: 200000, buildings: 0 },
    { id: 33, name: "Phước Vĩnh An", type: 'property', price: 350000, buildCost: 200000, rent: [35000, 175000, 500000, 1100000, 1300000], colorGroup: 'era8', buildings: 0, header: 4 },
    { id: 34, name: "Địa đạo Củ Chi", type: 'property', price: 350000, buildCost: 200000, rent: [35000, 175000, 500000, 1100000, 1300000], colorGroup: 'era8', buildings: 0, header: 4 },
    { id: 35, name: "Chùa Hội Phước", type: 'property', price: 400000, buildCost: 200000, rent: [50000, 200000, 600000, 1400000, 1700000], colorGroup: 'era8', buildings: 0, header: 4 },
];

export const opportunityCards = [
    { text: "Quốc khố thặng dư. Nhận 200000 tiền.", action: 'add_money', value: 200000 },
    { text: "Được mùa, nông sản bội thu. Nhận 100000 tiền.", action: 'add_money', value: 100000 },
    { text: "Trúng thầu công trình quốc gia. Nhận 500000 tiền.", action: 'add_money', value: 500000 },
    { text: "Sửa chữa thành trì, chi 100000 cho mỗi công trình.", action: 'pay_per_building', value: 100000 },
    { text: "Thoát khỏi ngục tù. Giữ lá bài này.", action: 'get_out_of_jail_free', value: 1 },
    { text: "Tiến đến ô Lập Quốc.", action: 'move_to', value: 0 },
    { text: "Tiến đến Thành Thăng Long.", action: 'move_to', value: 25 },
    { text: "Nộp phạt vì đi sai luật. Mất 50000 tiền.", action: 'remove_money', value: 50000 },
];

export const destinyCards = [
    { text: "Thiên tai, mất mùa. Mất 150000 tiền.", action: 'remove_money', value: 150000 },
    { text: "Bị giặc ngoại xâm quấy phá. Mất 100000 tiền.", action: 'remove_money', value: 100000 },
    { text: "Đi thẳng vào tù, không đi qua ô Lập Quốc.", action: 'go_to_jail', value: null },
    { text: "Khao quân, mỗi người chơi khác nhận 50000 tiền từ bạn.", action: 'pay_players', value: 50000 },
    { text: "Nhận tiền mừng từ các lãnh chúa. Mỗi người chơi khác trả bạn 50000.", action: 'collect_from_players', value: 50000 },
    { text: "Tiến lùi 3 bước.", action: 'move_steps', value: -3 },
];

export const characterCards = [
    { id: 'lac_long_quan', name: "Lạc Long Quân", description: "Bắt đầu với 2,500,000 tiền thay vì 2,000,000." },
    { id: 'au_co', name: "Âu Cơ", description: "Khi đi qua ô Bắt Đầu, nhận thêm 500,000 tiền." },
    { id: 'ly_thuong_kiet', name: "Lý Thường Kiệt", description: "Giảm 10% chi phí xây dựng công trình." },
    { id: 'tran_hung_dao', name: "Trần Hưng Đạo", description: "Trả tiền thuê đất cho người chơi khác được giảm 10%." },
    { id: 'quang_trung', name: "Quang Trung", description: "Lần đầu vào tù được miễn phí." },
    { id: 'le_loi', name: "Lê Lợi", description: "Nhận miễn phí 1 vùng đất Thời kỳ 1 đầu tiên bạn đặt chân đến." },
];

// CSS Grid uses a 1-based index for grid lines.
// This array maps the square ID to its position on the 10x10 grid.
export const gridPositions = [
    // Bottom row (right to left)
    { id: 0, area: '10 / 10' }, // Bottom-right corner
    { id: 1, area: '10 / 9' },
    { id: 2, area: '10 / 8' },
    { id: 3, area: '10 / 7' },
    { id: 4, area: '10 / 6' },
    { id: 5, area: '10 / 5' },
    { id: 6, area: '10 / 4' },
    { id: 7, area: '10 / 3' },
    { id: 8, area: '10 / 2' },
    { id: 9, area: '10 / 1' }, // Bottom-left corner

    // Left column (bottom to top)
    { id: 10, area: '9 / 1' },
    { id: 11, area: '8 / 1' },
    { id: 12, area: '7 / 1' },
    { id: 13, area: '6 / 1' },
    { id: 14, area: '5 / 1' },
    { id: 15, area: '4 / 1' },
    { id: 16, area: '3 / 1' },
    { id: 17, area: '2 / 1' },

    // Top row (left to right)
    { id: 18, area: '1 / 1' }, // Top-left corner
    { id: 19, area: '1 / 2' },
    { id: 20, area: '1 / 3' },
    { id: 21, area: '1 / 4' },
    { id: 22, area: '1 / 5' },
    { id: 23, area: '1 / 6' },
    { id: 24, area: '1 / 7' },
    { id: 25, area: '1 / 8' },
    { id: 26, area: '1 / 9' },

    // Right column (top to bottom)
    { id: 27, area: '1 / 10' }, // Top-right corner
    { id: 28, area: '2 / 10' },
    { id: 29, area: '3 / 10' },
    { id: 30, area: '4 / 10' },
    { id: 31, area: '5 / 10' },
    { id: 32, area: '6 / 10' },
    { id: 33, area: '7 / 10' },
    { id: 34, area: '8 / 10' },
    { id: 35, area: '9 / 10' }
];