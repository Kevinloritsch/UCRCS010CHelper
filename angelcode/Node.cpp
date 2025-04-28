#include "Node.h"

#include <iostream>

using namespace std;

ostream& operator<< ( ostream &os, const Node &a ) {
  os << a.key << "(" << a.count << ")";
  return os;
}

Node::Node()
    : count(0),left(nullptr),right(nullptr)
{
}

Node::Node(const string& s)
    : key(s),count(1),left(nullptr),right(nullptr)
{
}

Node::~Node() {
  // delete is safe on a nullptr.  No need to check
  delete left;
  delete right;
}

Node & Node::operator=(const Node &rhs) {
  if (&rhs != this) {
    key = rhs.key;
    count = rhs.count;
  }
  return *this;
}
