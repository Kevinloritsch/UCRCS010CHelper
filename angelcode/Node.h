#pragma once

#include <string>
#include <iostream>

using namespace std;

struct Node {
  // As a struct, all these members are public (which is fine)
  string key;
  int count;
  Node *left;
  Node *right;

  Node();
  Node(const string& s);

  // Rule of three since I have a destructor that tears down the ENTIRE
  // tree starting here (treating this node as a mini-root value)
  ~Node();
  Node(const Node& other) = delete;
  Node& operator=(const Node &rhs);
};
std::ostream& operator<< ( std::ostream &os, const Node &a );

