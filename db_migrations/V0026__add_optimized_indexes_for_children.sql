-- Оптимизация для медицинских документов (используем child_id, не member_id)
CREATE INDEX idx_medical_docs_child_family ON t_p5815085_family_assistant_pro.children_medical_documents (child_id, family_id);

-- Оптимизация для школьных данных  
CREATE INDEX idx_school_member_family ON t_p5815085_family_assistant_pro.children_school (member_id, family_id);

-- Оптимизация для подарков с сортировкой по дате
CREATE INDEX idx_gifts_member_date_desc ON t_p5815085_family_assistant_pro.children_gifts (member_id, date DESC);

-- Оптимизация для мечт с фильтром по achieved
CREATE INDEX idx_dreams_member_family_achieved ON t_p5815085_family_assistant_pro.children_dreams (member_id, family_id, achieved);

-- Оптимизация для дневника с сортировкой
CREATE INDEX idx_diary_member_date_desc ON t_p5815085_family_assistant_pro.children_diary (member_id, date DESC);

-- Оптимизация для достижений с сортировкой
CREATE INDEX idx_achievements_member_date_desc ON t_p5815085_family_assistant_pro.children_achievements (member_id, date_earned DESC);

-- Оптимизация для оценок с сортировкой
CREATE INDEX idx_grades_school_date_desc ON t_p5815085_family_assistant_pro.children_grades (school_id, date DESC);

-- Оптимизация для домашних заданий
CREATE INDEX idx_homework_school_due_date ON t_p5815085_family_assistant_pro.children_homework (school_id, due_date);

-- Оптимизация для транзакций копилки
CREATE INDEX idx_transactions_piggybank_date ON t_p5815085_family_assistant_pro.children_transactions (piggybank_id, date DESC);

-- Оптимизация для тестов развития
CREATE INDEX idx_tests_member_status ON t_p5815085_family_assistant_pro.children_tests (member_id, family_id, status);

-- Оптимизация для активностей по развитию
CREATE INDEX idx_activities_development_status ON t_p5815085_family_assistant_pro.children_activities (development_id, status);