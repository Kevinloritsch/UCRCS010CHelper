#pragma once

#include "Node.h"

class BSTree {
  Node* root;

public:
  BSTree()
    : root(nullptr)
  {
  }
  ~BSTree() {
    // Safe to delete nullptr, so no check needed
    // The Node class recursively deletes its children
    delete root;
  }
  BSTree(const BSTree&) = delete;
  BSTree& operator=(const BSTree&) = delete;
  
  void insert(const string& key);
  bool search(const string& key) const;
  string largest() const;
  string smallest() const;
  Node* largest(Node*);
  Node* smallest(Node*);
  int height(const string& key) const;
  void remove(const string& key);

  void preOrder() const;
  void postOrder() const;
  void inOrder() const;
  
  // PROFPAT: This is a helpful thing to see what your tree really looks like
  // PROFPAT: You should delete it before submitting (code turd)
  void debug() const {
    debug(root,0);
  }

private:
  // PROFPAT: You will probably want to write these helper functions to be
  // PROFPAT: recursive
  void remove(Node* parent, Node* tree, const string& key);
  int height_of(Node* tree) const;
  void preOrder(Node* tree) const;
  void postOrder(Node* tree) const;
  void inOrder(Node* tree) const;
  Node* nodeSearch(const string& key, Node* root, Node*& parent) const;


  // PROFPAT: Code turd -- remove before submitting
  void debug(Node* tree, int indent) const;
};
