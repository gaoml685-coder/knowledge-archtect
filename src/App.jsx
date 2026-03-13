import { useState } from 'react';
import HomePage from './components/HomePage';
import PPTGenerationFlow from './components/PPTGenerationFlow';
import PodcastGenerationFlow from './components/PodcastGenerationFlow';
import SkillMarketplace from './components/SkillMarketplace';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [projectData, setProjectData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const handleStartProject = (data) => {
    setProjectData(data);
    // 根据模式选择不同的页面
    if (data.mode === 'podcast') {
      setCurrentPage('podcast');
    } else {
      setCurrentPage('ppt');
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setProjectData(null);
  };

  const handleGoToSkillMarketplace = () => {
    setCurrentPage('skills');
  };

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'home' && (
        <HomePage
          onStartProject={handleStartProject}
          onGoToSkills={handleGoToSkillMarketplace}
          selectedSkill={selectedSkill}
          onClearSkill={() => setSelectedSkill(null)}
        />
      )}
      {currentPage === 'ppt' && (
        <PPTGenerationFlow
          projectData={projectData}
          onBack={handleBackToHome}
        />
      )}
      {currentPage === 'podcast' && (
        <PodcastGenerationFlow
          projectData={projectData}
          onBack={handleBackToHome}
        />
      )}
      {currentPage === 'skills' && (
        <SkillMarketplace
          onBack={handleBackToHome}
          onSelectSkill={handleSelectSkill}
        />
      )}
    </div>
  );
}

export default App;
