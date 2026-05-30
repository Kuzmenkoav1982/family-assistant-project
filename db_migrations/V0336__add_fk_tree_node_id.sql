ALTER TABLE t_p5815085_family_assistant_pro.family_members
  ADD CONSTRAINT family_members_tree_node_fk
  FOREIGN KEY (tree_node_id)
  REFERENCES t_p5815085_family_assistant_pro.family_tree(id)
  DEFERRABLE INITIALLY DEFERRED;