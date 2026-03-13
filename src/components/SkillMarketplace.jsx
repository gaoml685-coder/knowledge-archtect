import { useState } from 'react';
import { ArrowLeft, Search, Star, Users, TrendingUp, Sparkles, BookOpen, MessageSquare, Target, Award, Brain, FileText } from 'lucide-react';

const SkillMarketplace = ({ onBack, onSelectSkill }) => {
  const baseUrl = import.meta.env.BASE_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部', icon: Sparkles },
    { id: 'sales', name: '销售技能', icon: Target },
    { id: 'knowledge', name: '知识管理', icon: Brain },
    { id: 'training', name: '培训教育', icon: BookOpen },
    { id: 'communication', name: '沟通技巧', icon: MessageSquare },
  ];

  const skills = [
    {
      id: 1,
      name: '课件制作专家',
      description: '快速将录音、文档转化为专业培训课件，支持多种模板和风格',
      category: 'training',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      coverImage: `${baseUrl}skills/课件制作专家.png`,
      rating: 4.9,
      users: 1280,
      tags: ['PPT生成', '课件设计', '培训材料'],
    },
    {
      id: 2,
      name: '知识库管理专家',
      description: '智能整理和管理企业知识资产，构建可搜索的知识体系',
      category: 'knowledge',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      coverImage: `${baseUrl}skills/知识库管理专家.png`,
      rating: 4.8,
      users: 956,
      tags: ['知识整理', '文档管理', '智能检索'],
    },
    {
      id: 3,
      name: '金牌经纪人销售秘籍',
      description: '提炼顶尖经纪人的销售话术和成交技巧，快速复制成功经验',
      category: 'sales',
      icon: Award,
      color: 'from-orange-500 to-red-500',
      coverImage: `${baseUrl}skills/金牌经纪人销售秘籍.png`,
      rating: 5.0,
      users: 2340,
      tags: ['销售话术', '成交技巧', '经验复制'],
    },
    {
      id: 4,
      name: '客户异议场景复盘',
      description: '分析客户异议处理录音，总结应对策略，提升成交率',
      category: 'sales',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-500',
      coverImage: `${baseUrl}skills/客户异议场景复盘.png`,
      rating: 4.7,
      users: 1567,
      tags: ['异议处理', '场景复盘', '话术优化'],
    },
    {
      id: 5,
      name: '房产知识播客生成器',
      description: '将房产专业知识转化为生动的播客内容，提升客户信任度',
      category: 'communication',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      coverImage: `${baseUrl}skills/房产知识播客生成器.png`,
      rating: 4.6,
      users: 892,
      tags: ['播客制作', '内容营销', '专业传播'],
    },
    {
      id: 6,
      name: '新人培训加速器',
      description: '快速将老带教经验转化为标准化培训材料，缩短新人成长周期',
      category: 'training',
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-500',
      coverImage: `${baseUrl}skills/新人培训加速器.png`,
      rating: 4.8,
      users: 1123,
      tags: ['新人培训', '经验传承', '快速上手'],
    },
    {
      id: 7,
      name: '客户需求分析师',
      description: '从沟通记录中提取客户真实需求，精准匹配房源推荐',
      category: 'sales',
      icon: Target,
      color: 'from-pink-500 to-rose-500',
      coverImage: `${baseUrl}skills/客户需求分析师.png`,
      rating: 4.9,
      users: 1678,
      tags: ['需求分析', '精准匹配', '成交提升'],
    },
    {
      id: 8,
      name: '团队知识共享平台',
      description: '打造团队知识共享生态，让每个人的经验都能被复用',
      category: 'knowledge',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      coverImage: `${baseUrl}skills/团队知识共享库.png`,
      rating: 4.7,
      users: 2156,
      tags: ['团队协作', '知识共享', '经验沉淀'],
    },
  ];

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                技能广场
              </h1>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索技能..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Tabs */}
        <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
            >
              {/* Cover Image */}
              <div className="h-32 relative overflow-hidden">
                <img
                  src={skill.coverImage}
                  alt={skill.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {skill.name}
                  </h3>
                  <skill.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {skill.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-900">{skill.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{skill.users.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Hover Action */}
              <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onSelectSkill(skill)}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-glow transition-all"
                >
                  立即使用
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到相关技能</h3>
            <p className="text-gray-600">试试其他关键词或分类</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillMarketplace;