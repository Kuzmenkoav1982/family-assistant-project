INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.llm_enabled', 'LLM-answers in Dev Agent chat', 'stage', TRUE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.llm_enabled', 'LLM-answers in Dev Agent chat', 'prod', FALSE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.llm_debug_enabled', 'Save full LLM trace to S3', 'stage', TRUE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.llm_debug_enabled', 'Save full LLM trace to S3', 'prod', FALSE)
ON CONFLICT (code, environment) DO NOTHING;
