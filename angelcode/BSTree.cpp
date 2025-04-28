#include "BSTree.h"

#include <iostream>
#include <utility>

using namespace std;

void BSTree::insert(const string& key) {
  Node* parent = nullptr;
  Node* found = nodeSearch(key,root,parent);
  if(found) { 
    found->count++;
    return;
  }

  Node* newNode = new Node(key);
  if(root == nullptr) {
    root = newNode;
    return;
  }

  if(key > parent->key) {
    parent->right = newNode;
  }
  else{
    parent->left = newNode;
  }
}

Node* BSTree::nodeSearch(const string& key, Node* root, Node*& parent) const {
  if(root == nullptr) return nullptr; 
  if(root->key == key) return root;
  parent = root;
  if(key > root->key) return nodeSearch(key,root->right,parent);
  
  return nodeSearch(key,root->left,parent);
}

bool BSTree::search(const string& key) const {
  Node* useless = nullptr;
  return nodeSearch(key,root,useless);
}

string BSTree::largest() const {
  Node* curr = root;
  if(curr == nullptr) return "";

  while(curr->right){
    curr = curr->right;
  }

  return curr->key;
}

string BSTree::smallest() const {
  Node* curr = root;
  if(curr == nullptr) return "";

  while(curr->left){
    curr = curr->left;
  }

  return curr->key;

}
Node* BSTree::largest(Node* tree) {
  while(tree->right) {
    tree = tree->right;
  }
  return tree;
}
Node* BSTree::smallest(Node* tree) {
  while(tree->left) {
    tree = tree->left;
  }
  return tree;
}

int BSTree::height(const string& key) const {
  Node* parent = nullptr;
  Node* keyNode = nodeSearch(key,root,parent);
  return height_of(keyNode);
}

void BSTree::remove(const string& key) {
  Node* parent = nullptr;
  remove(parent,root,key);
}

void BSTree::preOrder() const {
  preOrder(root);
}
void BSTree::postOrder() const {
  postOrder(root);
}
void BSTree::inOrder() const {
  inOrder(root);
}

void BSTree::remove(Node* parent, Node* tree, const string& key) {
  // Hint: A good approach is to find the parent and the curr node that holds that key
  Node* kill = nodeSearch(key,tree,parent);

  // Edge case: The key is not found (do nothing)
  if(kill == nullptr) return;

  // Edge case.  The key count is greater than 1.  Just decrement the count
  if(kill->count > 1) {
    kill->count--;
    return;
  }
  
  // Edge case: leaf (no children).  Just remove from parent
  //  ==> case 1: parent is nullptr (we are removing the last node from root)
  //  ==> case 2: curr is the left child, remove it from parent
  //  ==> case 3: curr is the right child, remove it from parent
  if(!kill->left && !kill->right) {
    if(parent == nullptr) {
      delete kill;
      root = nullptr;
      return;
    }
    if(parent->left == kill) {
      parent->left = nullptr;
      delete kill;
      return;
    }
    parent->right = nullptr;
    delete kill;
    return;
  }

  // Typical case.  Find the target
  // It is either the largest key in the left tree (if one exists)
  // or the smallest key in the right tree (since not a leaf one will exist)
  // Copy the target information into the node we found, set the target count to
  // one, and recursively remove it from left or right subtree (current node is the parent)
  
  Node* target = kill;

  if(kill->left){
    target = largest(target->left);
  }
  else {
    target = smallest(target->right);
  }
  swap(kill->key,target->key);
  swap(kill->count,target->count);

  if(kill->left) {
    remove(kill,kill->left,key);
  }
  else {
    remove(kill,kill->right,key);
  }
  
}

int BSTree::height_of(Node* tree) const {
  // The height (length of longest path to the bottom) of an empty tree is -1
  // Otherwise, you pick the larger of the left height and the right height
  // and add one to that
  if(tree == nullptr) {
    return -1;
  }
  int left = height_of(tree->left) + 1;
  int right = height_of(tree->right) + 1;

  if(left > right) {
    return left;
  }

  return right;
}

void BSTree::preOrder(Node* tree) const {
  // print key, do left, do right
  if(tree == nullptr) return;
  cout << tree->key << "(" << tree->count << ")" << ", ";
  preOrder(tree->left);
  preOrder(tree->right);

} 

void BSTree::postOrder(Node* tree) const {
  // do left, do right, print key
  if(tree == nullptr) return;
  postOrder(tree->left);
  postOrder(tree->right);
  cout << tree->key << "(" << tree->count << ")" << ", ";
}

void BSTree::inOrder(Node* tree) const {
  // do left, print key, do right
  if(tree == nullptr) return;
  inOrder(tree->left);
  cout << tree->key << "(" << tree->count << ")" << ", ";
  inOrder(tree->right);
}

void BSTree::debug(Node* tree, int indent) const {
  // This is a pre-order traversal that shows the full state of the tree
  if (tree == nullptr) return;
  for(int i=0;i<4*indent;++i) cout << ' ';
  cout << tree << ' ' << *tree << endl;
  debug(tree->left,indent+1);
  for(int i=0;i<4*indent;++i) cout << ' ';
  cout << "-" << endl;
  debug(tree->right,indent+1);
}
