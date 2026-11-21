const GROUPS = [
  {
    key: 'start',
    name: '📌・『BẮT ĐẦU』',
    legacyCategoryName: '📌・BẮT ĐẦU',
    items: [
      ['📜・『nội-quy』', 'Đọc nội quy và quy tắc an toàn trước khi tham gia.'],
      ['👋・『chào-mừng』', 'Chào mừng đến với cộng đồng!'],
      ['✅・『xác-minh』', 'Thông tin xác minh và quy tắc an toàn.'],
      ['🎭・『nhận-role』', 'Dùng bảng role để chọn sở thích.']
    ]
  },
  {
    key: 'community',
    name: '💬・『CỘNG ĐỒNG』',
    legacyCategoryName: '💬・TRÒ CHUYỆN & GIAO LƯU',
    items: [
      ['💬・『chat-chung』', 'Trò chuyện và giao lưu cùng mọi người.'],
      ['🙋・『giới-thiệu』', 'Giới thiệu bản thân và sở thích.'],
      ['🌏・『tám-chuyện』', 'Chủ đề đời sống và tán gẫu.'],
      ['📸・『chia-sẻ-ảnh』', 'Chia sẻ ảnh và khoảnh khắc.']
    ]
  },
  {
    key: 'gaming',
    name: '🎮・『GAMING』',
    legacyCategoryName: '🎮・GAME & KẾT BẠN',
    items: [
      ['🎮・『game-chat』', 'Trò chuyện về game.'],
      ['🤝・『tìm-đồng-đội』', 'Tìm teammate và lập party.'],
      ['🏆・『khoe-rank』', 'Chia sẻ rank và thành tích.'],
      ['🎬・『highlight』', 'Clip highlight và gameplay.']
    ]
  },
  {
    key: 'trade',
    name: '🛍️・『TRADE』',
    legacyCategoryName: '🛍️・BUÔN BÁN & TRADE',
    items: [
      ['🛍️・『chợ-giao-dịch』', 'Khu vực mua bán và trao đổi.'],
      ['📦・『đăng-bán』', 'Đăng sản phẩm muốn bán.'],
      ['🔎・『tìm-mua』', 'Đăng nhu cầu muốn mua.'],
      ['✅・『đánh-giá』', 'Đánh giá giao dịch đã hoàn tất.']
    ]
  },
  {
    key: 'fun',
    name: '🎉・『GIẢI TRÍ』',
    legacyCategoryName: '🎉・BOT & GIẢI TRÍ',
    items: [
      ['🤖・『bot-commands』', 'Dùng lệnh bot và tiện ích tại đây.'],
      ['📊・『bình-chọn』', 'Poll và bình chọn cộng đồng.'],
      ['🎉・『sự-kiện』', 'Hoạt động và sự kiện.']
    ]
  },
  {
    key: 'support',
    name: '🎫・『HỖ TRỢ』',
    legacyCategoryName: '🎫・HỖ TRỢ',
    items: [
      ['🎫・『mở-ticket』', 'Dùng nút ticket panel để mở kênh riêng tư.'],
      ['❔・『faq-hỗ-trợ』', 'Các câu hỏi thường gặp.'],
      ['🧾・『hướng-dẫn』', 'Hướng dẫn sử dụng và giao dịch an toàn.']
    ]
  },
  {
    key: 'voice',
    name: '🔊・『VOICE』',
    legacyCategoryName: '🔊・PHÒNG VOICE',
    items: [
      ['🔊・『voice-lounge』', 'Phòng voice giao lưu chung.'],
      ['🎮・『gaming-party』', 'Voice tìm đồng đội và chơi game.'],
      ['🌙・『chill-room』', 'Phòng thư giãn.']
    ]
  },
  {
    key: 'staff',
    name: '🛡️・『STAFF』',
    legacyCategoryName: '🛡️・ĐỘI NGŨ',
    private: true,
    items: [
      ['🛡️・『staff-chat』', 'Kênh nội bộ đội ngũ.'],
      ['🧾・『staff-log』', 'Log hoạt động của bot và dashboard.'],
      ['✅・『legit-review』', 'Staff xem xét yêu cầu legit.'],
      ['🎫・『ticket-staff』', 'Điều phối hỗ trợ.']
    ]
  }
];

const CHANNEL_ALIASES = Object.freeze({
  '📜・『nội-quy』': '📜・nội-quy',
  '👋・『chào-mừng』': '👋・chào-mừng',
  '✅・『xác-minh』': '✅・xác-minh',
  '🎭・『nhận-role』': '🎭・nhận-role',
  '💬・『chat-chung』': '💬・chat-chung',
  '🙋・『giới-thiệu』': '👋・giới-thiệu',
  '🌏・『tám-chuyện』': '🌏・tám-chuyện',
  '📸・『chia-sẻ-ảnh』': '📸・khoe-ảnh',
  '🎮・『game-chat』': '🎮・game-chat',
  '🤝・『tìm-đồng-đội』': '🧑‍🤝‍🧑・tìm-đồng-đội',
  '🏆・『khoe-rank』': '🏆・khoe-rank',
  '🎬・『highlight』': '🎬・clip-game',
  '🛍️・『chợ-giao-dịch』': '🛍️・chợ-giao-dịch',
  '📦・『đăng-bán』': '📦・đăng-bán',
  '🔎・『tìm-mua』': '🛒・tìm-mua',
  '✅・『đánh-giá』': '⭐・đánh-giá-giao-dịch',
  '🤖・『bot-commands』': '🎲・bot-commands',
  '📊・『bình-chọn』': '📊・bình-chọn',
  '🎉・『sự-kiện』': '🎉・sự-kiện',
  '🎫・『mở-ticket』': '🎫・mở-ticket',
  '❔・『faq-hỗ-trợ』': '❔・faq-hỗ-trợ',
  '🧾・『hướng-dẫn』': '🧾・hướng-dẫn-giao-dịch',
  '🔊・『voice-lounge』': '🔊・voice-lounge',
  '🎮・『gaming-party』': '🎮・gaming-party-1',
  '🌙・『chill-room』': '🌙・chill-room',
  '🛡️・『staff-chat』': '🛡️・staff-chat',
  '🧾・『staff-log』': '🧾・staff-log',
  '✅・『legit-review』': '✅・legit-review',
  '🎫・『ticket-staff』': '🎫・ticket-staff'
});

const LEGACY_CHANNELS = Object.freeze([
  '📜・nội-quy', '👋・chào-mừng', '✅・xác-minh', '🎭・nhận-role', '📣・thông-báo',
  '💬・chat-chung', '👋・giới-thiệu', '🤝・làm-quen', '🫶・tìm-bạn', '❓・hỏi-đáp',
  '🌏・tám-chuyện', '📸・khoe-ảnh', '😂・meme', '🎨・sáng-tạo', '🎧・chia-sẻ-nhạc', '💡・ý-tưởng',
  '🎮・game-chat', '🧑‍🤝‍🧑・tìm-đồng-đội', '🔎・tìm-party', '🏆・khoe-rank',
  '🎬・clip-game', '🗓️・lịch-chơi', '🕹️・game-khac', '🎁・giveaway',
  '🛍️・chợ-giao-dịch', '📦・đăng-bán', '🛒・tìm-mua', '🔁・trao-đổi', '💬・hỏi-giá',
  '⭐・đánh-giá-giao-dịch', '✅・legit-vouches', '🛡️・yêu-cầu-middleman', '🚨・báo-cáo-scam',
  '🎲・bot-commands', '📊・bình-chọn', '🎉・sự-kiện', '🤖・bot-spam', '📜・góp-ý',
  '🎫・mở-ticket', '❔・faq-hỗ-trợ', '🧾・hướng-dẫn-giao-dịch',
  '🔊・voice-lounge', '🎮・gaming-party-1', '🎮・gaming-party-2', '🎮・gaming-party-3',
  '🤝・kết-bạn-voice', '🛍️・trade-talk', '🌙・chill-room', '🎵・music-lounge',
  '🛡️・staff-chat', '🧾・staff-log', '✅・legit-review', '🛍️・trade-reports',
  '🎫・ticket-staff', '🔨・mod-actions'
]);

const LEGACY_CATEGORIES = Object.freeze({
  start: '📌・BẮT ĐẦU',
  community: '💬・TRÒ CHUYỆN & GIAO LƯU',
  gaming: '🎮・GAME & KẾT BẠN',
  trade: '🛍️・BUÔN BÁN & TRADE',
  fun: '🎉・BOT & GIẢI TRÍ',
  support: '🎫・HỖ TRỢ',
  voice: '🔊・PHÒNG VOICE',
  staff: '🛡️・ĐỘI NGŨ',
  tickets: '🎫・TICKETS'
});

export function getServerBuilderGroups(topic = '') {
  const welcomeTopic = String(topic || '').trim().slice(0, 180);
  return GROUPS.map(group => ({
    key: group.key,
    name: group.name,
    legacyCategoryName: group.legacyCategoryName,
    private: Boolean(group.private),
    items: group.items.map(([name, description]) => [
      name,
      name === '👋・『chào-mừng』' && welcomeTopic ? welcomeTopic : description
    ])
  }));
}

export function getLegacyBuilderChannelName(channelName) {
  return CHANNEL_ALIASES[channelName] || null;
}

export function getLegacyBuilderChannelNames() {
  return [...LEGACY_CHANNELS];
}

export function getLegacyBuilderCategoryName(key) {
  return LEGACY_CATEGORIES[key] || null;
}

export function getTicketCategoryName() {
  return '🎫・『TICKETS』';
}

export function getServerBuilderPreview() {
  const groups = getServerBuilderGroups();
  return groups.map(group => [group.name, ...group.items.map(([name]) => name)]);
}
